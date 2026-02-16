import type { Response } from 'express';
import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import type { RequestWithUser } from '../../interfaces/common.js';

const userService = new UserService();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 */
export const getProfile = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const user = await userService.getProfile(req.user!.userId);
        ApiResponse.success(res, user, 'Profile retrieved');
    },
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated
 */
export const updateProfile = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const user = await userService.updateProfile(req.user!.userId, req.body);
        ApiResponse.success(res, user, 'Profile updated');
    },
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Soft delete current user account
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Account deleted
 */
export const deleteAccount = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        await userService.softDeleteUser(req.user!.userId);
        ApiResponse.success(res, null, 'Account deleted successfully');
    },
);
