import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult} from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import jwt from 'jsonwebtoken';
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
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array()); // Simulate an error  
            // return res.status(400).send({ errors: errors.array() });
        }
        console.log('Creating a user...');  
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
);

export { router as signupRouter };