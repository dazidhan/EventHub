import { z } from 'zod';
import { UserRole } from '../../interfaces/common.js';

export const registerSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            'Password must contain uppercase, lowercase, number, and special character',
        ),
    name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    role: z
        .nativeEnum(UserRole)
        .optional()
        .default(UserRole.USER),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z
        .string({ required_error: 'Refresh token is required' })
        .min(1, 'Refresh token is required'),
});

export const verifyEmailSchema = z.object({
    token: z
        .string({ required_error: 'Verification token is required' })
        .min(1, 'Verification token is required'),
});

// ─── Inferred Types ──────────────────────────────────────
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
