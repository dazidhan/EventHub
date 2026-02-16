import type { Response } from 'express';
import { EventService } from './event.service.js';
import { ApiResponse } from '../../utils/response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import type { RequestWithUser } from '../../interfaces/common.js';

const eventService = new EventService();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Organizer only)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, date, endDate, location, venue, capacity]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               venue:
 *                 type: string
 *               capacity:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Event created
 *       403:
 *         description: Forbidden
 */
export const createEvent = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const event = await eventService.createEvent(req.body, req.user!.userId);
        ApiResponse.created(res, event, 'Event created successfully');
    },
);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all published events (paginated, filtered)
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Paginated events
 */
export const getEvents = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { events, meta } = await eventService.getEvents(req.query as Record<string, string>);
        ApiResponse.paginated(res, events, meta, 'Events retrieved');
    },
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 */
export const getEventById = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const event = await eventService.getEventById(String(req.params.id));
        ApiResponse.success(res, event, 'Event retrieved');
    },
);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Update event (owner Organizer only)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated
 */
export const updateEvent = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const event = await eventService.updateEvent(
            String(req.params.id),
            req.body,
            req.user!.userId,
        );
        ApiResponse.success(res, event, 'Event updated');
    },
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event (owner Organizer only)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
export const deleteEvent = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        await eventService.deleteEvent(String(req.params.id), req.user!.userId);
        ApiResponse.success(res, null, 'Event deleted');
    },
);

/**
 * @swagger
 * /events/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Publish status updated
 */
export const togglePublish = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const event = await eventService.togglePublish(
            String(req.params.id),
            req.user!.userId,
            req.body.isPublished,
        );
        ApiResponse.success(res, event, 'Event publish status updated');
    },
);
