import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', 
    [body('email').isEmail().withMessage('Email must be valid'), 
    body('password').trim().notEmpty().withMessage('You must supply a Password')], 
    validateRequest,
   async (req: Request, res: Response) => {
    console.log('Signin a user...'); // Simulate a successful sign-in
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
});

export { router as signinRouter };