import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { BadRequestError, NotFoundError, requireAuth, UnauthorizedError, validateRequest } from '@ticko/common';
import { body } from 'express-validator';

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

    if(ticket.userId !== req.currentUser!.id) {
        throw new UnauthorizedError();
    }
    
    ticket.set({
        title,
        price
    });

    ticket.save().catch((error) => {
        console.error('Error saving ticket:', error);
        throw new BadRequestError(`Error updating ticket - ${error.message}`);
    });

    res.send({ message: 'Ticket has been updated successfully'});
});

export { router as updateTicketRouter };