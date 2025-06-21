import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

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

describe('GET /api/orders', () => {
    it('returns 401 if user is not authenticated', async () => {
        await request(app)
            .get('/api/orders')
            .send()
            .expect(401);
    });

    it('returns an empty array if user has no orders', async () => {
        const cookie = global.signin();
        const response = await request(app)
            .get('/api/orders')
            .set('Cookie', cookie)
            .send()
            .expect(200);

        expect(response.body).toEqual([]);
    });

    it('fetches orders for a particular user', async () => {
         process.env.ORDER_EXPIRATION_WINDOW_MINUTES = '15'; // Set environment variable for order expiration
        // Create three tickets
        const ticketOne = await buildTicket();
        const ticketTwo = await buildTicket();
        const ticketThree = await buildTicket();

        const userOne = global.signin();
        const userTwo = global.signin();

        // User one orders one ticket
        await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ ticketId: ticketOne.id })
            .expect(201);

        // User two orders two tickets
        const { body: orderOne } = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketTwo.id })
            .expect(201);

        const { body: orderTwo } = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketThree.id })
            .expect(201);

        // Fetch orders for user two
        const response = await request(app)
            .get('/api/orders')
            .set('Cookie', userTwo)
            .send()
            .expect(200);

        expect(response.body.length).toEqual(2);
        expect(response.body[0].id).toEqual(orderOne.orderId);
        expect(response.body[1].id).toEqual(orderTwo.orderId);
    });

    it('populates ticket details in the response', async () => {
        const ticket = await buildTicket();
        const user = global.signin();

        const { body: order } = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id })
            .expect(201);

        const response = await request(app)
            .get('/api/orders')
            .set('Cookie', user)
            .send()
            .expect(200);

        expect(response.body[0].ticket.title).toEqual(ticket.title);
        expect(response.body[0].ticket.price).toEqual(ticket.price);
    });
});