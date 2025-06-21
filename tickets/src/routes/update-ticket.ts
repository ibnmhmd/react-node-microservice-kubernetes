import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { BadRequestError, NotFoundError, requireAuth, UnauthorizedError, validateRequest } from '@ticko/common';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
     body('title').not().isEmpty().withMessage('Invalid ticket Title'), 
     body('price').isFloat({ gt: 0 }).withMessage('Price must be a valid number greater than 0')
     ], validateRequest, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, price } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new NotFoundError();
    }
    if(ticket.orderId){
        throw new BadRequestError('Cannot edit a reserved Ticket.')
    }
    if(ticket.userId !== req.currentUser!.id) {
        throw new UnauthorizedError();
    }
    
    ticket.set({
        title,
        price
    });

    try {
        ticket.save().catch((error) => {
            console.error('Error saving ticket:', error);
            throw new Error(error.message);
        });

      new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        }).then(() => {
          console.log('Ticket Updated Event published successfully');
            res.send({
              message: 'Ticket has been updated successfully',
              ticket
            });
        }).catch((err) => {
          console.error('Error publishing Ticket Updated Event:', err);
          throw new Error(`Error publishing Ticket Created Event - ${err.message}`);
        });
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        throw new BadRequestError(`Error updating ticket - ${error.message}`);   
    }
});

export { router as updateTicketRouter };