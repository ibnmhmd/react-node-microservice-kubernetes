import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app'; // Adjust the import path as necessary
let mongo: MongoMemoryServer;

declare global {
    var signin: (id?: string) => string[];
}

process.env.STRIPE_KEY = "sk_test_51RbmnwRKn3z0SaojlI5R7scCj8TrI0NEBnmvFzLmeovX2KMQsHd4FOKLpWKDCyElOHcaMvXGD4bgWWa2c4LSxp8i00nuh4iB6o";
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


global.signin =  (id?: string) => {
    const payload = {
        email: 'test@test.com',
        id: id || new mongoose.Types.ObjectId().toHexString(),
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const session = { jwt: token };
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`session=${base64}`]; //return [`session=${base64}`];
};

// jest.mock('../stripe');
jest.mock('../nats-wrapper'); // Mocking natsWrapper for testing purposes
