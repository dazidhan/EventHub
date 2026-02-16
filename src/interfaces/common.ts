import type { Request } from 'express';
import type { Types } from 'mongoose';

// ─── Roles ───────────────────────────────────────────────
export enum UserRole {
    ADMIN = 'ADMIN',
    ORGANIZER = 'ORGANIZER',
    USER = 'USER',
}

// ─── JWT ─────────────────────────────────────────────────
export interface JwtPayload {
    userId: string;
    role: UserRole;
}

export interface JwtTokenPair {
    accessToken: string;
    refreshToken: string;
}

// ─── Authenticated Request ───────────────────────────────
export interface AuthUser {
    userId: string;
    role: UserRole;
}

export interface RequestWithUser extends Request {
    user?: AuthUser;
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginationQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ─── Event Filters ───────────────────────────────────────
export interface EventFilterQuery extends PaginationQuery {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    isPublished?: string;
}

// ─── Payment ─────────────────────────────────────────────
export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

// ─── Ticket Types ────────────────────────────────────────
export enum TicketTypeEnum {
    VIP = 'VIP',
    REGULAR = 'REGULAR',
    EARLY_BIRD = 'EARLY_BIRD',
}

// ─── MongoDB Document Base ──────────────────────────────
export interface MongoTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface MongoDocument extends MongoTimestamps {
    _id: Types.ObjectId;
}
