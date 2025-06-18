import { Listener, OrderCreatedEvent, Subjects } from '@ticko/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../../constants';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject : Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Handle the event data here
        console.log('Order Created Event data:', data);
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new Error('No ticket found in this order');
        }

        ticket.set({ orderId: data?.id });
        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish({ 
          id: ticket.id, title: ticket.title, 
          price: ticket.price, version: ticket.version, 
          orderId: data?.id, userId: data.userId
        });
        // Acknowledge the message
        msg.ack();
    }
}