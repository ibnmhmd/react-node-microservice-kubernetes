import { BadRequestError, NotFoundError, OrderStatus, requireAuth, UnauthorizedError, validateRequest } from '@ticko/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, [ 
     body('token').not().isEmpty().withMessage('Token is required'),
     body('orderId').not().isEmpty().withMessage('OrderId is required')
    ], validateRequest, async (req: Request, res: Response) => {
    const { token , orderId } = req.body;
    const order = await Order.findById(orderId);

    if(!order){
        throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
        throw new UnauthorizedError();
    }
    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError('Cannot purchase an already cancelled Order.');
    }
    
    const stripeResponse = await stripe.charges.create({
        currency: 'USD',
        source: token,
        amount: order.price*100
    });

    if(!stripeResponse){
        throw new BadRequestError('Failed to process payment');
    }
    const payment =  Payment.build({ orderId: order.id , stripeId: stripeResponse.id });
    await payment.save();
    
    new PaymentCreatedPublisher(natsWrapper.client).publish({
        orderId: payment.orderId,
        stripeId: stripeResponse.id,
        id: payment.id
    });

    res.status(201).send({ orderId , success: true, paymentId: payment.id  });
});

export { router as createChargeRouter };