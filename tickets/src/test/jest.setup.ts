import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app'; // Adjust the import path as necessary
let mongo: MongoMemoryServer;

declare global {
    var signin: () => string[];
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


global.signin =  () => {
    const payload = {
        email: 'test@test.com',
        id: new mongoose.Types.ObjectId().toHexString(),
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const session = { jwt: token };
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`session=${base64}`]; //return [`session=${base64}`];
};