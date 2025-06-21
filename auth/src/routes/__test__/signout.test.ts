import request from 'supertest';
import { app } from '../../app';

describe('Signout Route', () => {
    it('clears the session after signing out', async () => {
        // Simulate signing in
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201);

        // Sign out
        const response = await request(app)
            .post('/api/users/signout')
            .send({})
            .expect(200);

        // Check if session is cleared
        expect(response.get('Set-Cookie')?.[0]).toContain('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
    });

    it('returns a success message on signout', async () => {
        const response = await request(app)
            .post('/api/users/signout')
            .send({})
            .expect(200);

        expect(response.body).toEqual({
            message: 'Successfully signed out',
            signedout: true,
        });
    });

    it('handles signout even if no session exists', async () => {
        const response = await request(app)
            .post('/api/users/signout')
            .send({})
            .expect(200);

        expect(response.body).toEqual({
            message: 'Successfully signed out',
            signedout: true,
        });
    });
});