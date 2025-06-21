import express from "express";
import asyncHandler from "express-async-handler";
import {  errorHandler, NotFoundError, currentUser } from '@ticko/common';
import cookieSession from 'cookie-session';
import { createOrderRouter } from './routes/create-order';
import { getOrderByIdRouter } from './routes/get-order';
import { getOrdersRouter } from './routes/get-orders';
import { cancelOrderRouter } from './routes/cancel-order';
import { get } from "mongoose";

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
app.use(createOrderRouter);
app.use(getOrderByIdRouter);
app.use(getOrdersRouter);
app.use(cancelOrderRouter);

app.all('/{*splat}', asyncHandler(async (req, res, next) => {
  throw new NotFoundError();
}));
// Health check route
app.get('/health', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);

export { app, PORT };
