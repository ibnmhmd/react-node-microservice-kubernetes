import nats, { Stan } from 'node-nats-streaming';

const clientId = `publisher-${Math.floor(Math.random() * 100000)}`;
const stan: Stan = nats.connect('ticketing', clientId, {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log('Publisher connected to NATS');

    const data = JSON.stringify({
        id: '123',
        title: 'concert',
        price: 20,
    });

    stan.publish('ticket:created', data, () => {
        console.log('Event published');
        stan.close();
    });
});

stan.on('close', () => {
    process.exit();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());