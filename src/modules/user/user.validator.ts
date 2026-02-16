import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim()
        .optional(),
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
}).refine((data) => data.name || data.email, {
    message: 'At least one field (name or email) must be provided',
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
