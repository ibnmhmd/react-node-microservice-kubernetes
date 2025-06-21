import { NotFoundError, OrderStatus, requireAuth, UnauthorizedError } from '@ticko/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
    // Placeholder: Fetch orders for the current user
    // Replace with actual logic to fetch orders from your database
    if(!req.params || !req.params.id) {   
        throw new NotFoundError();
     }
    const orderId : any = req.params.id;
    const order = await Order.findById(orderId)?.populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new UnauthorizedError();
    }
    // Delete the order
     order.status = OrderStatus.Cancelled; // Assuming you want to set the status to 'Cancelled' instead of deleting
    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order?.id,
        userId: order?.userId,
        version: order?.version,
        ticket :{
            id : order.ticket.id,
            price: order.ticket.price
        }
    })
    res.status(204).send({ message: 'Order has been successfully cancelled' , orderId });
});

export { router as cancelOrderRouter };