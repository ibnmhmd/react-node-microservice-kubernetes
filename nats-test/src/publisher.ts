import nats, { Stan } from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

const clientId = `publisher-${Math.floor(Math.random() * 100000)}`;
const stan: Stan = nats.connect('ticketing-456611', clientId, {
    url: 'http://localhost:4222',
});

console.clear();
stan.on('connect', async () => {
    console.log('Publisher connected to NATS');
    const data = {
        id: '123',
        title: 'Concert Ticket',
        price: 20
    };
    const ticketCreatedPublisher = new TicketCreatedPublisher(stan);
    ticketCreatedPublisher.publish(data).then(() => {
            console.log('Ticket Created Event published successfully');
    }).catch((err) => {
            console.error('Error publishing Ticket Created Event:', err);
    });
});

stan.on('close', () => {
    console.log('Publisher NATS connection closed!');
    process.exit();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());