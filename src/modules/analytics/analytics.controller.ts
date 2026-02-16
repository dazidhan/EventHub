import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';

const analyticsService = new AnalyticsService();

/**
 * @swagger
 * /analytics/events/{eventId}:
 *   get:
 *     summary: Get analytics for a specific event (Organizer/Admin)
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event analytics
 */
export const getEventAnalytics = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await analyticsService.getEventAnalytics(String(req.params.eventId));
        ApiResponse.success(res, result, 'Event analytics retrieved');
    },
);

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get platform-wide analytics summary (Admin only)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Platform summary
 */
export const getPlatformSummary = asyncHandler(
    async (_req: Request, res: Response) => {
        const result = await analyticsService.getPlatformSummary();
        ApiResponse.success(res, result, 'Platform summary retrieved');
    },
);
