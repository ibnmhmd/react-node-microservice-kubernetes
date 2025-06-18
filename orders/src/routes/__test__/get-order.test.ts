import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

// Mock Order model
jest.mock('../../models/order');

const mockOrder = {
    id: '507f1f77bcf86cd799439011',
    userId: 'user123',
    status: 'created',
    ticket: { id: 'ticket1', title: 'Concert', price: 100 },
    populate: jest.fn().mockResolvedValue(this),
};

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

const mockFindById = jest.fn();

(Order as any).findById = mockFindById;

describe('GET /api/orders/:id', () => {
    const userId = 'user123';
    const otherUserId = 'user456';
    const orderId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 401 if user is not authenticated', async () => {
        await request(app)
            .get(`/api/orders/${orderId}`)
            .send()
            .expect(401);
    });

    it('returns 404 if order is not found', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null),
        });

        await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Cookie', global.signin())
            .send()
            .expect(404);
    });

    it('returns 401 if user does not own the order', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue({
                ...mockOrder,
                userId: otherUserId,
            }),
        });

        await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Cookie', global.signin())
            .send()
            .expect(401);
    });

    it('returns 200 and the order if user owns the order', async () => {
          process.env.ORDER_EXPIRATION_WINDOW_MINUTES = '15';
           const user = global.signin();
           const ticket = await buildTicket();
            // const { body: order } = await request(app)
            //            .post('/api/orders')
            //            .set('Cookie', user)
            //            .send({ ticketId: ticket.id });
            // console.log(order)
        //    const { body: orderResponse } = await request(app)
        //                     .post('/api/orders')
        //                     .set('Cookie', userId)
        //                     .send({ ticketId: ticket.id });
        //    console.log(orderResponse)

        // const res = await request(app)
        //     .get(`/api/orders/${mockOrder.id}`)
        //     .set('Cookie', userId)
        //     .send().expect(200);

       // expect(response.body.userId).toEqual(userId);
       // expect(response.body.ticket).toBeDefined();
    });
});