import mongoose from 'mongoose';
import { UserAttributes } from '../interface/user-attributes';
import { UserDoc, UserModel } from '../interface/user-model';
import { Password } from '../services/password';

// Define the User schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});


userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
};

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});
// Create the User model
// The User model is a class that extends mongoose.Model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };