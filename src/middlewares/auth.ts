import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { JwtPayload, RequestWithUser, UserRole } from '../interfaces/common.js';

/**
 * Middleware: Verifies JWT access token from Authorization header.
 * Attaches decoded user info to req.user.
 */
export function authenticate(
    req: RequestWithUser,
    _res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new UnauthorizedError('Access token is required');
    }

    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    } catch {
        throw new UnauthorizedError('Invalid or expired access token');
    }
}

/**
 * Middleware Factory: Restricts access to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * @example
 * router.post('/events', authenticate, requireRole('ORGANIZER', 'ADMIN'), createEvent);
 */
export function requireRole(...roles: UserRole[]) {
    return (req: RequestWithUser, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError(
                `Access denied. Required role(s): ${roles.join(', ')}`,
            );
        }

        next();
    };
}
