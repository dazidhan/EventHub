import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError, ValidationError } from '../utils/errors.js';
import { createModuleLogger } from '../config/logger.js';
import { env } from '../config/env.js';

const logger = createModuleLogger('error-handler');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    logger.error({ err, stack: err.stack }, `Unhandled error: ${err.message}`);

    // ── Zod Validation Errors ──
    if (err instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of err.issues) {
            const field = issue.path.join('.');
            if (!fieldErrors[field]) {
                fieldErrors[field] = [];
            }
            fieldErrors[field].push(issue.message);
        }

        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errorCode: 'VALIDATION_ERROR',
            errors: fieldErrors,
        });
        return;
    }

    // ── Custom App Errors ──
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            errors: err.errors,
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
        });
        return;
    }

    // ── Mongoose Cast Errors (invalid ObjectId etc.) ──
    if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({
            success: false,
            message: `Invalid value for ${err.path}: ${String(err.value)}`,
            errorCode: 'CAST_ERROR',
        });
        return;
    }

    // ── Mongoose Duplicate Key ──
    if (
        'code' in err &&
        (err as Record<string, unknown>).code === 11000
    ) {
        const keyValue = (err as Record<string, unknown>).keyValue as
            | Record<string, unknown>
            | undefined;
        const field = keyValue ? Object.keys(keyValue).join(', ') : 'unknown';
        res.status(409).json({
            success: false,
            message: `Duplicate value for: ${field}`,
            errorCode: 'DUPLICATE_KEY',
        });
        return;
    }

    // ── Mongoose Validation Error ──
    if (err instanceof mongoose.Error.ValidationError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const [field, error] of Object.entries(err.errors)) {
            fieldErrors[field] = [error.message];
        }
        res.status(422).json({
            success: false,
            message: 'Database validation failed',
            errorCode: 'MONGOOSE_VALIDATION_ERROR',
            errors: fieldErrors,
        });
        return;
    }

    // ── Fallback: Unknown Error ──
    res.status(500).json({
        success: false,
        message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        errorCode: 'INTERNAL_ERROR',
        ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}
