import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

describe('PUT /api/update/:id', () => {
    it('has a route handler listening to /api/update/:id for put requests', async () => {
        const response = await request(app)
            .put('/api/tickets/someid')
            .send({});
        expect(response.status).not.toEqual(404);
    });

    it('returns 404 if the ticket does not exist', async () => {
        const id = new mongoose.Types.ObjectId().toHexString(); // Generate a valid ObjectId
        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', global.signin())
            .send({ title: 'New Title', price: 100 })
            .expect(404);
    });

    it('returns 400 if the title or price is invalid', async () => {
        const cookie = global.signin();
        // Assume we have a valid ticket created first
        const createRes = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title: 'Valid Title', price: 20 });
            
        await request(app)
            .put(`/api/tickets/${createRes.body.ticket.id}`)
            .set('Cookie', cookie)
            .send({ title: '', price: 20 })
            .expect(400);

        await request(app)
            .put(`/api/tickets/${createRes.body.ticket.id}`)
            .set('Cookie', cookie)
            .send({ title: 'Valid Title', price: -10 })
            .expect(400);
    });

    it('updates the ticket with valid inputs', async () => {
        const user = global.signin();
        const createRes = await request(app)
            .post('/api/tickets')
            .set('Cookie', user)
            .send({ title: 'Original Title', price: 50 });

        const updateRes = await request(app)
            .put(`/api/tickets/${createRes.body.ticket.id}`)
            .set('Cookie', user)
            .send({ title: 'Updated Title', price: 60 })
            .expect(200);

        const updatedTicket = await request(app)
            .get(`/api/tickets/${createRes.body.ticket.id}`)
            .send()
            .expect(200);
            
        expect(updatedTicket.body.title).toEqual('Updated Title');
        expect(updatedTicket.body.price).toEqual(60);
        expect(updateRes.body.message).toEqual('Ticket has been updated successfully');
    });

    it('returns 401 if the user is not authenticated', async () => {
        const user = global.signin();
        const createRes = await request(app)
            .post('/api/tickets')
            .set('Cookie', user)
            .send({ title: 'Title', price: 10 });

        await request(app)
            .put(`/api/tickets/${createRes.body.ticket.id}`)
            .send({ title: 'New Title', price: 20 })
            .expect(401);
    });

    it('returns 403 if the user does not own the ticket', async () => {
        // User 1 creates a ticket
        const user1 = global.signin();
        const user2 = global.signin();

        const createRes = await request(app)
            .post('/api/tickets')
            .set('Cookie', user1)
            .send({ title: 'User1 Ticket', price: 30 });
        // User 2 tries to update User 1's ticket
        await request(app)
            .put(`/api/tickets/${createRes.body.ticket.id}`)
            .set('Cookie', user2)
            .send({ title: 'Hacked Title', price: 40 })
            .expect(401);
    });
});