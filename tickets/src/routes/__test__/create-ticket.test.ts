import request from "supertest";
import { app } from "../../app";
import mongoose, { mongo } from "mongoose";
import { Ticket } from "../../models/ticket";

describe('Test the new Tickets service endpoints', () => {
    // Empty test suite
    it('has a route handler listening to /api/tickets for post requests', async () => {
       const response = await request(app)
            .post('/api/tickets')
            .send({});
       expect(response.status).not.toEqual(404);
    });

    it('can only be accessed if the user is signed in', async () => {
       const response = await request(app)
            .post('/api/tickets')
            .send({})
            .expect(401);

           
    });

    it('returns a status other than 401 if the user is signed in', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({});
        expect(response.status).not.toEqual(401);
    });

    it('returns an error if an invalid title is provided', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({
                title: '',
                price: 10
            })
            .expect(400);

        expect(response.body.errors[0].message).toEqual('Title must be provided');
    });

    it('returns an error if an invalid price is provided', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({
                title: 'Valid Title',
                price: -10
            })
            .expect(400);

        expect(response.body.errors[0].message).toEqual('Price must be a valid number greater than 0');
    });

    it('creates a ticket with valid inputs', async () => {
        let ticket = await Ticket.find({});
        expect(ticket.length).toEqual(0);
        const title = 'Valid Title';
        const price = 20;
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({
                title,
                price
            })
            .expect(201);

        ticket = await Ticket.find({});
        expect(ticket.length).toEqual(1);
        expect(ticket[0].title).toEqual(title); 
        expect(ticket[0].price).toEqual(price);
        expect(response.body.message).toEqual('Ticket has been created successfully');
        // You can also check if the ticket is saved in the database here
  });
});