import type { Response } from 'express';
import { TicketService } from './ticket.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import type { RequestWithUser } from '../../interfaces/common.js';

const ticketService = new TicketService();

/**
 * @swagger
 * /events/{eventId}/ticket-types:
 *   post:
 *     summary: Create ticket type for an event (Organizer only)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, price, totalQuantity, saleStart, saleEnd]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [VIP, REGULAR, EARLY_BIRD]
 *               price:
 *                 type: number
 *               totalQuantity:
 *                 type: number
 *               saleStart:
 *                 type: string
 *                 format: date-time
 *               saleEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Ticket type created
 */
export const createTicketType = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const ticketType = await ticketService.createTicketType(
            String(req.params.eventId),
            req.body,
        );
        ApiResponse.created(res, ticketType, 'Ticket type created');
    },
);

/**
 * @swagger
 * /events/{eventId}/ticket-types:
 *   get:
 *     summary: Get all ticket types for an event
 *     tags: [Tickets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ticket types
 */
export const getTicketTypes = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const ticketTypes = await ticketService.getTicketTypes(String(req.params.eventId));
        ApiResponse.success(res, ticketTypes, 'Ticket types retrieved');
    },
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Purchase tickets (atomic transaction)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, ticketTypeId, quantity]
 *             properties:
 *               eventId:
 *                 type: string
 *               ticketTypeId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       201:
 *         description: Ticket purchased
 *       409:
 *         description: Not enough tickets available
 */
export const purchaseTicket = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const order = await ticketService.purchaseTicket(
            req.user!.userId,
            req.body,
        );
        ApiResponse.created(res, order, 'Ticket purchased successfully');
    },
);

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Get current user's order history
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order history
 */
export const getOrderHistory = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const orders = await ticketService.getOrderHistory(req.user!.userId);
        ApiResponse.success(res, orders, 'Order history retrieved');
    },
);
