import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/signout', (req: Request, res: Response) => {
    res.send({ signIn: 'Testing Signout API.' }); // Replace with actual logic to fetch the current user
});

export { router as signoutRouter };