import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { UserRole } from '../../interfaces/common.js';

const router = Router();

// All analytics routes are protected
router.use(authenticate);

router.get(
    '/events/:eventId',
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    analyticsController.getEventAnalytics,
);

router.get(
    '/summary',
    requireRole(UserRole.ADMIN),
    analyticsController.getPlatformSummary,
);

export default router;
