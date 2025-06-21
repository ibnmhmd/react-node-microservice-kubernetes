import { Message } from 'node-nats-streaming';
import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@ticko/common';
import { queueGroupName } from '../../constants';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        // Implement your logic here, e.g., update order status
        const order = await Order.findById({ id: data.orderId });
        if(!order){
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();
        // Acknowledge the message
        msg.ack();
    }
}