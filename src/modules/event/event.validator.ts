import { z } from 'zod';

export const createEventSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
    description: z
        .string({ required_error: 'Description is required' })
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description cannot exceed 5000 characters'),
    category: z
        .string({ required_error: 'Category is required' })
        .min(2, 'Category must be at least 2 characters')
        .trim(),
    date: z
        .string({ required_error: 'Event date is required' })
        .datetime('Invalid date format (use ISO 8601)'),
    endDate: z
        .string({ required_error: 'End date is required' })
        .datetime('Invalid date format (use ISO 8601)'),
    location: z
        .string({ required_error: 'Location is required' })
        .min(2, 'Location must be at least 2 characters')
        .trim(),
    venue: z
        .string({ required_error: 'Venue is required' })
        .min(2, 'Venue must be at least 2 characters')
        .trim(),
    capacity: z
        .number({ required_error: 'Capacity is required' })
        .int('Capacity must be an integer')
        .min(1, 'Capacity must be at least 1'),
    imageUrl: z.string().url('Invalid URL').optional(),
    tags: z.array(z.string().trim()).optional().default([]),
}).refine((data) => new Date(data.endDate) > new Date(data.date), {
    message: 'End date must be after start date',
    path: ['endDate'],
});

export const updateEventSchema = z.object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(10).max(5000).optional(),
    category: z.string().min(2).trim().optional(),
    date: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z.string().min(2).trim().optional(),
    venue: z.string().min(2).trim().optional(),
    capacity: z.number().int().min(1).optional(),
    imageUrl: z.string().url().optional().nullable(),
    tags: z.array(z.string().trim()).optional(),
});

export const eventFilterSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    category: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    search: z.string().optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type EventFilterDto = z.infer<typeof eventFilterSchema>;
