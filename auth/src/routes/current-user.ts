import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req: Request, res: Response) => {
    res.send({ currentUser: 'Testing Current User API.' }); // Replace with actual logic to fetch the current user
});

export { router as currentUserRouter };