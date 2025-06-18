import { BadRequestError, requireAuth, validateRequest } from '@ticko/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body("title").not().isEmpty().withMessage("Title must be provided"),
    body("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be a valid number greater than 0")
   ], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;

    try {
        const currentUser = req.currentUser;
        const ticket = Ticket.build({
                title,
                price,
                userId: currentUser!.id // Assuming currentUser is set by requireAuth middleware
            });
        await ticket.save();
    
        new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        }).then(() => {
        console.log('Ticket Created Event published successfully');
        res.status(201).send({
          message: 'Ticket has been created successfully',
          ticket
        });
        }).catch((err) => {
          console.error('Error publishing Ticket Created Event:', err);
          throw new Error(`Error publishing Ticket Created Event - ${err.message}`);
        });
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        throw new BadRequestError(`Error creating ticket - ${error.message}`);  
    }
});

export { router as createTicketRouter };