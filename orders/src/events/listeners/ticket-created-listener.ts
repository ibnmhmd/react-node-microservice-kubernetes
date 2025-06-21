import { Message } from 'node-nats-streaming';
import { ITicketCreatedEvent, Listener, Subjects } from '@ticko/common';
import { queueGroupName } from '../../constants';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ITicketCreatedEvent['data'], msg: Message) {
        // Handle the event data (e.g., save ticket info to database)
        console.log('Event data:', data);
        const { id , title , price , version } = data;
        const ticket = Ticket.build({ id  , title , price , version });
        await ticket.save();
        // Acknowledge the message
        msg.ack();
    }
}