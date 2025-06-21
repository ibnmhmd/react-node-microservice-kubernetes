import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@ticko/common';
import { natsWrapper } from '../../nats-wrapper';

// Helper to create a ticket
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

describe('Test the CREATE_ORDER API Functionality at => POST /api/orders', () => {
    it('has a route handler listening to /api/orders for post requests', async () => {
        const response = await request(app)
            .post('/api/orders')
            .send({});
        expect(response.status).not.toEqual(404);
    });

    it('returns 401 if user is not authenticated', async () => {
        await request(app)
            .post('/api/orders')
            .send({ ticketId: 'someid' })
            .expect(401);
    });

    it('returns 400 if ticketId is not provided', async () => {
        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({})
            .expect(400);
    });

    it('returns 404 if ticket does not exist', async () => {
        const ticketId = new mongoose.Types.ObjectId();
        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId })
            .expect(404);
    });

    it('returns 400 if ticket is already reserved', async () => {
        const ticket = await buildTicket();
        const order = Order.build({
            ticket,
            userId: 'someuserid',
            status: OrderStatus.Created,
            expiresAt: new Date(),
        });
        await order.save();

        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(400);
    });

    it('returns 400 if ORDER_EXPIRATION_WINDOW_MINUTES is not set', async () => {
        const ticket = await buildTicket();
        const original = process.env.ORDER_EXPIRATION_WINDOW_MINUTES;
        delete process.env.ORDER_EXPIRATION_WINDOW_MINUTES;

        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(400);

        process.env.ORDER_EXPIRATION_WINDOW_MINUTES = original;
    });

    it('creates an order with valid inputs', async () => {
        process.env.ORDER_EXPIRATION_WINDOW_MINUTES = '15';
        const ticket = await buildTicket();

        const response = await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(201);

        expect(response.body.orderId).toBeDefined();
        expect(response.body.message).toEqual('Order has been successfully created');
    });

    it('publishes an order created event', async() => {
          process.env.ORDER_EXPIRATION_WINDOW_MINUTES = '15';
        const ticket = await buildTicket();

        const response = await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(201);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    }); // Placeholder for event publishing test
});