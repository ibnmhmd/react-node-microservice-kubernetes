import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error for debugging purposes
    if(err instanceof RequestValidationError) {
        const formattedErrors = err.errors.map((error) => {
            if(error.type === 'field') {
                return { message: error.msg, field: error.path };
            }
        });
        return res.status(400).send({ errors: formattedErrors });
    }
    if(err instanceof DatabaseConnectionError) {   
        res.status(500).send({ errors : [{ message: err.reason }] });
     }
    res.status(400).send({ errors: [{ message: err.message }] });
};

export { errorHandler };