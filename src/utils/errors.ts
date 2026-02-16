import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
        errorCode = 'INTERNAL_ERROR',
        isOperational = true,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, StatusCodes.NOT_FOUND, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(message = 'Validation failed', errors: Record<string, string[]> = {}) {
        super(message, StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, StatusCodes.CONFLICT, 'CONFLICT');
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST');
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, StatusCodes.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS');
    }
}
