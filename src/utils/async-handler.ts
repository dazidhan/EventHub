import type { Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler to automatically catch
 * rejected promises and forward them to the error-handling middleware.
 */
export function asyncHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
