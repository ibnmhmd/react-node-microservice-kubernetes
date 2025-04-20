export class DatabaseConnectionError extends Error {
    reason: string;

    constructor() {
        super('Error connecting to database');
        this.reason = 'Failed to connect to the database';

        // Only because we are extending a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }
}