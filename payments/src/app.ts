import express from "express";
import asyncHandler from "express-async-handler";
import {  errorHandler, NotFoundError, currentUser } from '@ticko/common';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/create-charge';


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

app.use(currentUser);
app.use(createChargeRouter);

app.all('/{*splat}', asyncHandler(async (req, res, next) => {
  throw new NotFoundError();
}));
// Health check route
app.get('/health', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);

export { app, PORT };
