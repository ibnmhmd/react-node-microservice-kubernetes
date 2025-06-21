import mongoose from 'mongoose';
import { app , PORT } from './app';
import { DatabaseConnectionError } from '@ticko/common';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedEventListener } from './events/listeners/order-created-event';

// import { natsWrapper } from './nats-wrapper';

const start = async () => {
  try {
    if(!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }

    await connectToNATSServer();
    await connectToMongoDB();   

  } catch (error: any) {
    console.error(error);
    throw new Error(`Error starting the ${process.env.POD_NAME} server: ${error?.message ?? 'Unknown error'}`);
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Pods ${process.env.POD_NAME} is running on http://ticketing.com`);
  });
}

const connectToMongoDB = async () : Promise<void> => {
     const mongoUri = process.env.MONGO_URI;
     const mongoDb = process.env.MONGO_DB;
     if (!mongoUri ||!mongoDb) {
       throw new Error('MONGO_URI and MONGO_DB must be defined');
     } 

    return new Promise((resolve, reject) => {
      mongoose.connect(`${mongoUri}/${mongoDb}`).then(() => {
      console.log(`Pod ${process.env.POD_NAME} has successfully connected to MongoDB at ${mongoUri}/${mongoDb}`);
      resolve();
      }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        reject(new DatabaseConnectionError());
      })
   }); 
}

const connectToNATSServer = async () => {
  const natsClusterId = process.env.NATS_CLUSTER_ID;
  const natsClientId =  process.env.NATS_CLIENT_ID;
  const natsUrl = process.env.NATS_URL; // Default NATS URL, can be overridden by environment variable
  if(!natsClusterId) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  
  if(!natsClientId) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if(!natsUrl) {
    throw new Error('NATS_URL must be defined');
  }
  return new Promise<void>((resolve, reject) => {
  natsWrapper.connect(natsClusterId, natsClientId, natsUrl)
    .then(() => {
      natsWrapper.client.on('close', () => {
        console.log(`NATS connection in pod ${process.env.POD_NAME} closed!`);
        process.exit();
      });
      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());
      new OrderCancelledListener(natsWrapper.client).listen();
      new OrderCreatedEventListener(natsWrapper.client).listen();
      resolve();
    }).catch((err) => {
      reject(`Error connecting to NATS in pod ${process.env.POD_NAME}: - ${err} `);
    });
   });
}

start().catch((error) => {
  console.error('Error starting the server:', error);
  //-- throw new BadRequestError('Error starting the server: ' + error.message);
  process.exit(1);
});
