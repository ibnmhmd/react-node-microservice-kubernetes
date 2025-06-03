import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app'; // Adjust the import path as necessary
let mongo: MongoMemoryServer;

declare global {
    var signin: () => Promise<string[]>;
}
beforeAll(async () => {
    process.env.JWT_KEY = 'test_jwt_key'; // Set environment variables needed for tests
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.db ? await mongoose.connection.db.collections() : [];
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});


global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app).post('/api/users/signup').send({
        email,
        password,
    }).expect(201);
    // Simulate signing in

    const cookie = response.get('Set-Cookie') ?? [];
    return cookie;
};