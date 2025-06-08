import request from 'supertest';
import { app } from '../../app';

describe('GET /api/tickets', () => {
    it('has a route handler listening to /api/tickets for get requests', async () => {
        const response = await request(app)
            .get('/api/tickets')
            .send();
        expect(response.status).not.toEqual(404);
    });
    it('returns an empty array when there are no tickets', async () => {
        const response = await request(app)
            .get('/api/tickets')
            .send();
        expect(response.status).toEqual(200);
        expect(response.body).toEqual([]);
    });

    it('returns a list of tickets', async () => {
        // Create tickets
        const tickets = [
            { title: 'Concert', price: 100 },
            { title: 'Movie', price: 50 },
            { title: 'Play', price: 75 }
        ];

        for (const ticket of tickets) {
            await request(app)
                .post('/api/tickets')
                .set('Cookie', global.signin())
                .send(ticket)
                .expect(201);
        }

        const response = await request(app)
            .get('/api/tickets')
            .send()
            .expect(200);

        expect(response.body.length).toBe(3);
        expect(response.body[0]).toMatchObject({ title: 'Concert', price: 100 });
        expect(response.body[1].title).toEqual('Movie');
        expect(response.body[2]).toMatchObject({ title: 'Play', price: 75 });
    });

    it('does not return tickets from other endpoints', async () => {
        // Assuming there are other endpoints, ensure only tickets are returned
        const response = await request(app)
            .get('/api/tickets')
            .send()
            .expect(200);

        for (const ticket of response.body) {
            expect(ticket).toHaveProperty('title');
            expect(ticket).toHaveProperty('price');
            expect(ticket).toHaveProperty('id'); // Assuming tickets have an id field
        }
    });
});