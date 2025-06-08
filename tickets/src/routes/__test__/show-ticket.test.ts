import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

describe('Test the Get ticket route', () => {
    it('has a route handler listening to /api/tickets/:id for show ticket', async () => {
        const res = await request(app)
            .get('/api/tickets/someid')
            .send();
        expect(res.status).not.toEqual(404);
    });

    it('returns 404 if the ticket is not found', async () => {
       const id = new mongoose.Types.ObjectId().toHexString(); // Generate a valid ObjectId
       await request(app)
            .get(`/api/tickets/${id}`)
            .send().expect(404);
    });

    it('returns the ticket if the ticket is found', async () => {
        // First, create a ticket
        const ticketResponse = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({
                title: 'Concert',
                price: 100,
            }).expect(201);

        // Then, fetch the ticket
        const response = await request(app)
            .get(`/api/tickets/${ticketResponse.body.ticket.id}`)
            .send();
        expect(response.body.title).toEqual('Concert');
        expect(response.body.price).toEqual(100);
    });
});