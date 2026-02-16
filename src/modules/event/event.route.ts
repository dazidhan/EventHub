import { Router } from 'express';
import * as eventController from './event.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { UserRole } from '../../interfaces/common.js';
import {
    createEventSchema,
    updateEventSchema,
    eventFilterSchema,
} from './event.validator.js';

const router = Router();

// Public routes
router.get(
    '/',
    validate(eventFilterSchema, 'query'),
    eventController.getEvents,
);

router.get('/:id', eventController.getEventById);

// Protected routes — Organizer & Admin only
router.post(
    '/',
    authenticate,
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createEventSchema),
    eventController.createEvent,
);

router.patch(
    '/:id',
    authenticate,
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(updateEventSchema),
    eventController.updateEvent,
);

router.delete(
    '/:id',
    authenticate,
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    eventController.deleteEvent,
);

router.patch(
    '/:id/publish',
    authenticate,
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    eventController.togglePublish,
);

export default router;
