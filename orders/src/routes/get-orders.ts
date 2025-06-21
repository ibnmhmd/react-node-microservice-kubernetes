import { NotFoundError, requireAuth } from '@ticko/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
    // Placeholder: Fetch orders for the current user
    // Replace with actual logic to fetch orders from your database
    const orders =  await Order.find({
        userId: req.currentUser!.id,
    }).populate('ticket'); // Assuming you want to populate the ticket details
    
    if (!orders) {
        throw new NotFoundError();
    }

    res.status(200).send(orders);
});

export { router as getOrdersRouter };