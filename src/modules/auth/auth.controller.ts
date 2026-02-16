import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import type { RequestWithUser } from '../../interfaces/common.js';

const authService = new AuthService();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ORGANIZER]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already registered
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, 'Registration successful');
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns tokens
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    ApiResponse.success(res, result, 'Login successful');
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 */
export const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await authService.refreshToken(req.body);
        ApiResponse.success(res, result, 'Token refreshed');
    },
);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       404:
 *         description: Invalid token
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    await authService.verifyEmail(String(req.params.token));
    ApiResponse.success(res, null, 'Email verified successfully');
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (invalidate refresh token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
export const logout = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        await authService.logout(req.user!.userId);
        ApiResponse.success(res, null, 'Logged out successfully');
    },
);
