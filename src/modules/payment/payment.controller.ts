import type { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';

const paymentService = new PaymentService();

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Simulate payment webhook callback
 *     tags: [Payments]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, status, webhookSecret]
 *             properties:
 *               paymentId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *               webhookSecret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed
 */
export const processWebhook = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await paymentService.processWebhook(req.body);
        ApiResponse.success(res, result, 'Webhook processed');
    },
);

/**
 * @swagger
 * /payments/{paymentId}/status:
 *   get:
 *     summary: Get payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 */
export const getPaymentStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await paymentService.getPaymentStatus(String(req.params.paymentId));
        ApiResponse.success(res, result, 'Payment status retrieved');
    },
);
