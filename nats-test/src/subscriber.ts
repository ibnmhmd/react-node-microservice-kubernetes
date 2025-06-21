import nats, { Message, Stan } from 'node-nats-streaming';
import TicketCreatedListener from './events/ticket-created-listener';

const clusterId = 'ticketing-456611';
// Generate a unique client ID for the listener
const clientId = 'listener-' + Math.random().toString(36).substring(2, 10);
const stan = nats.connect(clusterId, clientId, {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log('Listener connected to NATS');

    const ticketCreatedListener = new TicketCreatedListener(stan);
    ticketCreatedListener.listen();
});

stan.on('close', () => {
    console.log('Listener NATS connection closed!');
    process.exit();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());




