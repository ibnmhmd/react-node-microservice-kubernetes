import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest , BadRequestError } from '@ticko/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post('/api/users/signin', 
    [body('email').isEmail().withMessage('Email must be valid'), 
    body('password').trim().notEmpty().withMessage('You must supply a Password')], 
    validateRequest,
    asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Simulate a user sign-in process
    // In a real application, you would check the email and password against the database
    // and create a session for the user if the credentials are valid.
   
    const userFound = await User.findOne({ email });
    if (!userFound) {
        throw new BadRequestError('Invalid credentials');
    }
    const passwordMatch = await Password.compare(userFound.password, password);
    if (!passwordMatch) {
         throw new BadRequestError('Invalid credentials');
    }
    const userJwt = jwt.sign({ id: userFound.id, email: userFound.email }, process.env.JWT_KEY!);
    req.session = { jwt: userJwt }; // Store it on session object
    res.status(200).send(userFound);
}));

export { router as signinRouter };