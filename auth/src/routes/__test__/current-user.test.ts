import request from 'supertest';
import { app } from '../../app';


describe('Get the current user details after successfully signing up', () => {
    it('responds with details about the current user when authenticated', async () => {
        const cookie = await global.signin();

        const response = await request(app)
            .get('/api/users/currentuser')
            .set('Cookie', cookie)
            .send()
            .expect(200);

        expect(response.body.currentUser.email).toEqual('test@test.com');
    });

    it('responds with null if not authenticated', async () => {
        const response = await request(app)
            .get('/api/users/currentuser')
            .send()
            .expect(200);

        expect(response.body.currentUser).toBeNull();
    });
});