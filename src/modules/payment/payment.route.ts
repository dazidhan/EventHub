import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// Public: webhook endpoint (called by payment gateway)
router.post('/webhook', paymentController.processWebhook);

// Protected: check payment status
router.get(
    '/:paymentId/status',
    authenticate,
    paymentController.getPaymentStatus,
);

export default router;
