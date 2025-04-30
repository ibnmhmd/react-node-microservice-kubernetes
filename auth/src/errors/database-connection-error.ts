import { CustomError } from "../abstract/custom-error";

export class DatabaseConnectionError extends CustomError {
    reason: string;
    statusCode = 500;

    constructor() {
        super('Error connecting to database');
        this.reason = 'Failed to connect to MongoDB';

        // Only because we are extending a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors() {
        return [{ message: this.reason }];
    }
}