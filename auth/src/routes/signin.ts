import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/signin', (req: Request, res: Response) => {
    res.send({ signIn: 'Testing Signin API.' }); // Replace with actual logic to fetch the current user
});

export { router as signinRouter };