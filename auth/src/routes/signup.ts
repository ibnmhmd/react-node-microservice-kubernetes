import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult} from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

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
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array()); // Simulate an error  
            // return res.status(400).send({ errors: errors.array() });
        }
        console.log('Creating a user...');  
        const { email, password } = req.body;
        throw new DatabaseConnectionError(); // Simulate an error
        res.send({  email , password }); // Replace with actual logic to fetch the current user
    }
);

export { router as signupRouter };