import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@ticko/common';
import { queueGroupName } from '../../constants';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Implement your logic here, e.g., update payment status, etc.
        const order = await Order.findOne({ _id: data.id , version: data.version-1 });
        if(!order){
            throw new Error('Order not found');
        }
        order.set({ status : OrderStatus.Cancelled });
        await order.save();
        // Acknowledge the message
        msg.ack();
    }
}