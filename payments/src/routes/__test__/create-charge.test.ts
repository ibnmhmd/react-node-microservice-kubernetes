import request from 'supertest';
import { app } from '../../app'; // Assumes you have an express app exported from app.ts
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@ticko/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

const createOrder =  async () => {
  const order = await Order.build({ 
            id: new mongoose.Types.ObjectId().toHexString(),
            version: 1,
            userId: 'user123',
            price: 10,
            status: OrderStatus.Created
        });

   return order;
} 

describe('POST /api/payments', () => {
    
    it('returns 401 if user is not authenticated', async () => {
        await request(app)
            .post('/api/payments')
            .send({ token: 'tok_visa', orderId: 'order123' })
            .expect(401);
    });

    it('returns 400 if token is missing', async () => {
        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({ orderId: 'order123' })
            .expect(400);
    });

    it('returns 400 if orderId is missing', async () => {
        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({ token: 'tok_visa' })
            .expect(400);
    });

     it('returns 404 if the order is not found', async () => {
      await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({ token: 'tok_visa', orderId: new mongoose.Types.ObjectId().toHexString() })
            .expect(404);
    });

     it('returns 401 if the user does not own the order', async () => {
        const userId = global.signin();
        const order = Order.build({ 
            id: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            userId: new mongoose.Types.ObjectId().toHexString(),
            price: 10,
            status: OrderStatus.Created
        });
        await order.save();
        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({ token: 'tok_visa', orderId: order.id })
            .expect(401);
       });

       it('returns 400 if purchasing a cancelled order', async () => {
            const id = new mongoose.Types.ObjectId().toHexString();
            const order = Order.build({ 
                id: new mongoose.Types.ObjectId().toHexString(),
                version: 0,
                userId: id,
                price: 10,
                status: OrderStatus.Cancelled
            });
            await order.save();
            const response = await request(app)
                .post('/api/payments')
                .set('Cookie', global.signin(id))
                .send({ token: 'tok_visa', orderId: order.id });
                expect(response.status).toEqual(400);
                expect(response.body.errors[0].message).toEqual('Cannot purchase an already cancelled Order.');
            

       });

      it('returns 201 and the token and orderId if valid inputs are provided', async () => {
           const id = new mongoose.Types.ObjectId().toHexString();
           const price = Math.floor(Math.random()*100000);
           const token = 'tok_visa';
            const order = Order.build({ 
                id: new mongoose.Types.ObjectId().toHexString(),
                version: 0,
                userId: id,
                price,
                status: OrderStatus.Created
            });
            await order.save();
            const orderId = order.id;
            const response = await request(app)
                .post('/api/payments')
                .set('Cookie', global.signin(id))
                .send({ token, orderId });
                expect(response.status).toEqual(201);
            
              // expect(stripe.charges.create).toHaveBeenCalled();
               const stripeCharges = await stripe.charges.list({ limit: 50 });
               const stripeCharge = stripeCharges.data.find(charge => charge.amount === price*100 );
               const payment = await Payment.findOne({ orderId , stripeId: stripeCharge!.id});
               expect(response.body.paymentId).not.toBeNull();
               expect(stripeCharge).toBeDefined();
               expect(stripeCharge?.amount).toEqual(price*100);
               expect(payment).not.toBeNull();
      });
});