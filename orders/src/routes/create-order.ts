import express, { Request, Response } from 'express';
import { currentUser , validateRequest , requireAuth, NotFoundError, OrderStatus, BadRequestError } from '@ticko/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
const router = express.Router();

router.post('/api/orders', requireAuth , 
    [body('ticketId').not().isEmpty().withMessage('Order ID must be a provided')], 
    validateRequest, async (req: Request, res: Response) => {
    // Placeholder: Fetch orders for the current user
    // Replace with actual logic to fetch orders from your database
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    // Check if the ticket is already reserved
    if (isReserved) {
        throw new BadRequestError('This Ticket has already been reserved');
    }

    if(!process.env.ORDER_EXPIRATION_WINDOW_MINUTES) {
        throw new BadRequestError('ORDER_EXPIRATION_WINDOW_MINUTES environment variable is not set');
    }
    const expiration = new Date();
    const expirationWindowsMinutes = parseInt(process.env.ORDER_EXPIRATION_WINDOW_MINUTES) || 15; // Default to 15 minutes if not set
    expiration.setSeconds(expiration.getSeconds() + expirationWindowsMinutes); // 15 minutes from now

    const order = await Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket,
    });

    await order.save();
    // Publish an event that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({ 
        id: order.id,
        userId: order.userId,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        version: order?.version,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    });
    // Return the order to the client
    // This is a placeholder for the actual ticket ID
    res.status(201).send({ message: 'Order has been successfully created', orderId: order.id });
});

export { router as createOrderRouter };