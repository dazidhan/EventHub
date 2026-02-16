import { Router } from 'express';
import * as ticketController from './ticket.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { UserRole } from '../../interfaces/common.js';
import {
    createTicketTypeSchema,
    purchaseTicketSchema,
} from './ticket.validator.js';

const router = Router();

// ─── Ticket Type Routes (nested under /events/:eventId) ──
// These are mounted from the main route index

// ─── Order Routes ────────────────────────────────────────
router.post(
    '/orders',
    authenticate,
    validate(purchaseTicketSchema),
    ticketController.purchaseTicket,
);

router.get(
    '/orders/me',
    authenticate,
    ticketController.getOrderHistory,
);

export default router;

// ─── Ticket Type sub-router (for /events/:eventId/ticket-types) ──
export const ticketTypeRouter = Router({ mergeParams: true });

ticketTypeRouter.post(
    '/',
    authenticate,
    requireRole(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createTicketTypeSchema),
    ticketController.createTicketType,
);

ticketTypeRouter.get(
    '/',
    ticketController.getTicketTypes,
);
