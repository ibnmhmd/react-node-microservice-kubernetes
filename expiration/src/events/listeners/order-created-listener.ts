import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@ticko/common';
import { queueGroupName } from '../../constants';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName ;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        // Handle the order created event logic here
        await expirationQueue.add(
            { orderId: data?.id },
            { delay });
        // Acknowledge the message
        msg.ack();
    }
}