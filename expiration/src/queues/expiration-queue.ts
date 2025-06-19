import Queue from 'bull';
import { expirationRedisQueueName } from '../constants';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
    orderId: string;
}

// Create a Bull queue for expiration events
const expirationQueue = new Queue<Payload>(expirationRedisQueueName, {
    redis: { host: process.env.REDIS_HOST    }
});

expirationQueue.process( async (job) => {
    const orderId = job?.data?.orderId ?? -1;
    console.log('received a job from REDIS via the expiration queue service for OrderId#' + orderId);
    new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId })
}); 

export { expirationQueue };