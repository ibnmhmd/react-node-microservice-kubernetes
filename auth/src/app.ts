import express from "express";
import asyncHandler from "express-async-handler";
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
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

export { app  , PORT};
