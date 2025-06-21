import mongoose from 'mongoose';
import { app , PORT } from './app';
import { DatabaseConnectionError } from '@ticko/common';
const start = async () => {
  try {
    if(!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }
    const mongoUri = process.env.MONGO_URI;
    const mongoDb = process.env.MONGO_DB;
    if (!mongoUri || !mongoDb) {
      throw new Error('MONGO_URI and MONGO_DB must be defined');
    } 
    // Connect to MongoDB

    
    await mongoose.connect(`${mongoUri}/${mongoDb}`);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error(error);
    throw new DatabaseConnectionError();
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://ticketing.com`);
  });
}

start().catch((error) => {
  console.error('Error starting the server:', error);
  //-- throw new BadRequestError('Error starting the server: ' + error.message);
  process.exit(1);
});
