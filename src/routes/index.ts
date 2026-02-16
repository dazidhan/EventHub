import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route.js';
import userRoutes from '../modules/user/user.route.js';
import eventRoutes from '../modules/event/event.route.js';
import ticketRoutes, { ticketTypeRouter } from '../modules/ticket/ticket.route.js';
import paymentRoutes from '../modules/payment/payment.route.js';
import analyticsRoutes from '../modules/analytics/analytics.route.js';

const router = Router();

// ─── Module Routes ──────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/events/:eventId/ticket-types', ticketTypeRouter);
router.use('/', ticketRoutes); // /orders, /orders/me
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);

// ─── Health Check ────────────────────────────────────────
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'EventHub API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
