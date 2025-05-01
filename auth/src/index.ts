import express from "express";
import asyncHandler from "express-async-handler"
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from "./errors/database-connection-error";
import { BadRequestError } from "./errors/bad-request-error";
import cookieSession from 'cookie-session';
require('dotenv').config();

const app = express();
app.set('port', process.env.PORT || 3000);
app.set('trust proxy', true); // trust first proxy
const PORT = app.get('port');
// Middleware
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

// Routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', asyncHandler(async (req, res, next) => {
  throw new NotFoundError();
}));
// Health check route
app.get('/health', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);

const start = async () => {
  try {
    if(!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }
    const mongoUri = process.env.MONGO_URI;
    const mongoDb = process.env.MONGO_DB;
    if (!mongoUri) {
      throw new Error('MONGO_URI must be defined');
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
