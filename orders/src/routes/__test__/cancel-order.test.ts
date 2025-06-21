import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@ticko/common';
import mongoose from 'mongoose';

// Mock natsWrapper
jest.mock('../../nats-wrapper');

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 1
    });
    await ticket.save();
    return ticket;
};

const buildOrder = async (userId: string, ticketId: string) => {
    const ticket = await buildTicket();
    const order = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();
    return order;
};

describe('DELETE /api/orders/:id', () => {
    it('returns 404 if order id param is missing', async () => {
        await request(app)
            .delete('/api/orders/')
            .set('Cookie', global.signin())
            .expect(404);
    });

    it('returns 404 if order does not exist', async () => {
        process.env.ORDER_EXPIRATION_WINDOW_MINUTES = '15';
        const fakeId = new mongoose.Types.ObjectId().toHexString();
        const ticket = await buildTicket();
        const userId = global.signin();
        // const { body: orderResponse } = await await request(app)
        //             .post('/api/orders')
        //             .set('Cookie', userId)
        //             .send({ ticketId: ticket.id });

        //console.log(orderResponse)
        await request(app)
            .delete(`/api/orders/${fakeId}`)
            .set('Cookie', userId).expect(404);
    });

    it('returns 401 if user does not own the order', async () => {
         const userId = global.signin();
         const ticket = await buildTicket();
         const { body: orderResponse } = await await request(app)
                    .post('/api/orders')
                    .set('Cookie', userId)
                    .send({ ticketId: ticket.id });

        await request(app)
            .delete(`/api/orders/${orderResponse.orderId}`)
            .set('Cookie', global.signin()) // different user
            .expect(401);
    });

    it('cancels the order if user is authorized', async () => {
         const userId = global.signin();
         const ticket = await buildTicket();
         const { body: orderResponse } = await await request(app)
                    .post('/api/orders')
                    .set('Cookie', userId)
                    .send({ ticketId: ticket.id });

        await request(app)
            .delete(`/api/orders/${orderResponse.orderId}`)
            .set('Cookie', userId)
            .expect(204);

        const updatedOrder = await Order.findById(orderResponse.orderId);
        expect(updatedOrder!.status[0]).toEqual(OrderStatus.Cancelled);
    });

    it('publishes an event when order is cancelled', async () => {
         const userId = global.signin();
         const ticket = await buildTicket();
         const { body: orderResponse } = await await request(app)
                    .post('/api/orders')
                    .set('Cookie', userId)
                    .send({ ticketId: ticket.id });

        await request(app)
            .delete(`/api/orders/${orderResponse.orderId}`)
            .set('Cookie', userId)
            .expect(204);

        expect(require('../../nats-wrapper').natsWrapper.client.publish).toHaveBeenCalled();
    });
});