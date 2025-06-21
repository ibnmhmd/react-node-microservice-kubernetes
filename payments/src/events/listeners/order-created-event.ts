import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from '@ticko/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../../constants';
import { Order } from '../../models/order';

export class OrderCreatedEventListener extends Listener<OrderCreatedEvent> {
    subject : Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

   async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    console.log('receive data in payment message', JSON.stringify(data));
    console.log(data.status[0] as OrderStatus)
       const order =  Order.build({
        id: data.id,
        version: data.version,
        userId: data.userId,
        price: data.ticket.price,
        status: data.status[0] as OrderStatus
       });

       await order.save();
       msg.ack();
   }
}