import { BadRequestError, NotFoundError, OrderStatus, requireAuth, UnauthorizedError, validateRequest } from '@ticko/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';

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
    
    await stripe.charges.create({
        currency: 'USD',
        source: token,
        amount: order.price*100
    })

    res.status(201).send({ token , orderId  });
});

export { router as createChargeRouter };