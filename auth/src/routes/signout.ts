import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/signout', (req: Request, res: Response) => {
    req.session = null; // Clear the session
    res.status(200).send({ message: 'Successfully signed out', signedout: true });
});

export { router as signoutRouter };