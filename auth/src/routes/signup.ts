import express from 'express';
import { Request, Response } from 'express';
import { body} from 'express-validator';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middlewares/validate-request';
import asyncHandler from "express-async-handler";
const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    validateRequest,
    asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const userFound = await User.findOne({ email });
        if(userFound) {
            throw new BadRequestError('User already exists');
        }
        const user = User.build({ email, password });
        await user.save();
        const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!);
        req.session = { jwt: userJwt }; // Store it on session object
        res.status(201).send(user);
    }
));

export { router as signupRouter };