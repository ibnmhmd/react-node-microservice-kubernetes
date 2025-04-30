import mongoose from 'mongoose';
import { UserAttributes } from './user-attributes';



// An interface that describes the properties
// that a User Model has
export interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttributes): UserDoc;
}

// An interface that describes the properties
// that a User Document has
export interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}
