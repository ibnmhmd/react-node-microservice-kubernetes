import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  try {
    await connectToNATSServer();
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error starting the ${process.env.POD_NAME} server: ${error?.message ?? 'Unknown error'}`);
  }
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
      new OrderCreatedListener(natsWrapper.client).listen();
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
