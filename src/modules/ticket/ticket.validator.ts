import { z } from 'zod';
import { TicketTypeEnum } from '../../interfaces/common.js';

export const createTicketTypeSchema = z.object({
    name: z
        .string({ required_error: 'Ticket name is required' })
        .min(2, 'Name must be at least 2 characters')
        .trim(),
    type: z.nativeEnum(TicketTypeEnum, {
        required_error: 'Ticket type is required',
    }),
    price: z
        .number({ required_error: 'Price is required' })
        .min(0, 'Price cannot be negative'),
    totalQuantity: z
        .number({ required_error: 'Total quantity is required' })
        .int('Quantity must be an integer')
        .min(1, 'Must have at least 1 ticket'),
    saleStart: z
        .string({ required_error: 'Sale start date is required' })
        .datetime('Invalid date format'),
    saleEnd: z
        .string({ required_error: 'Sale end date is required' })
        .datetime('Invalid date format'),
}).refine((data) => new Date(data.saleEnd) > new Date(data.saleStart), {
    message: 'Sale end date must be after sale start date',
    path: ['saleEnd'],
});

export const purchaseTicketSchema = z.object({
    eventId: z
        .string({ required_error: 'Event ID is required' })
        .min(1),
    ticketTypeId: z
        .string({ required_error: 'Ticket type ID is required' })
        .min(1),
    quantity: z
        .number({ required_error: 'Quantity is required' })
        .int('Quantity must be an integer')
        .min(1, 'Must purchase at least 1 ticket')
        .max(10, 'Cannot purchase more than 10 tickets at once'),
});

export type CreateTicketTypeDto = z.infer<typeof createTicketTypeSchema>;
export type PurchaseTicketDto = z.infer<typeof purchaseTicketSchema>;
