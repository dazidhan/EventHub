import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a middleware that validates the specified request property
 * against a Zod schema. On failure, throws a ZodError caught by
 * the global error handler.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const parsed = schema.parse(req[target]) as Record<string, unknown>;
        // Replace the target with the parsed (and potentially transformed) data
        if (target === 'body') {
            req.body = parsed;
        } else if (target === 'query') {
            Object.assign(req.query, parsed);
        } else {
            Object.assign(req.params, parsed);
        }
        next();
    };
}
