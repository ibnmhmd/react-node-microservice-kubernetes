import Queue from 'bull';
import { expirationRedisQueueName } from '../constants';

interface Payload {
    orderId: string;
}

// Create a Bull queue for expiration events
const expirationQueue = new Queue<Payload>(expirationRedisQueueName, {
    redis: { host: process.env.REDIS_HOST    }
});

expirationQueue.process( async (job) => {
    console.log('received a job from REDIS via the queue' + job);
}); 

export { expirationQueue };