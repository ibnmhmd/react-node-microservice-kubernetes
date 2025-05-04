import { CustomError } from '../abstract/custom-error';

export class UnauthorizedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Not authorized');

        // Only because we are extending a built-in class
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }

    serializeErrors() {
        return [{ message: 'Not authorized' }];
    }
}