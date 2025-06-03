import request from 'supertest';
import { app } from '../../app';

describe('Signin API', () => {
    it('returns a 200 on successful signin', async () => {
        // First, sign up a user
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201);

        // Then, sign in with the same credentials
        const response = await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(200);

        expect(response.body.email).toEqual('test@test.com');
        expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('fails when an email that does not exist is supplied', async () => {
        await request(app)
            .post('/api/users/signin')
            .send({
                email: 'nonexistent@test.com',
                password: 'password',
            })
            .expect(400);
    });

    it('fails when an incorrect password is supplied', async () => {
        // First, sign up a user
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201);

        // Then, attempt to sign in with an incorrect password
        await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: 'wrongpassword',
            })
            .expect(400);
    });

    it('returns a 400 with missing email and password', async () => {
        await request(app)
            .post('/api/users/signin')
            .send({
                email: '',
                password: '',
            })
            .expect(400);
    });

    it('returns a 400 with an invalid email format', async () => {
        await request(app)
            .post('/api/users/signin')
            .send({
                email: 'invalid-email',
                password: 'password',
            })
            .expect(400);
    });
});