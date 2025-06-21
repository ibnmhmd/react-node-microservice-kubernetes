import { BadRequestError, NotFoundError, requireAuth, UnauthorizedError } from '@ticko/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:id',requireAuth, async (req: Request, res: Response) => {
    // Placeholder: Fetch orders for the current user
    // Replace with actual logic to fetch orders from your database
    
    if(!req.params || !req.params.id) {
        throw new NotFoundError();
    }

    const orderId : any = req.params.id;
    const order = await Order.findById(orderId).populate('ticket'); // Assuming you want to populate the ticket details
    if (!order) {
        throw new NotFoundError();
    }

    if(order.userId !== req.currentUser!.id) {
        throw new UnauthorizedError();
    }

    res.status(200).send(order);
});

export { router as getOrderByIdRouter };