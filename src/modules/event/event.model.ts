import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────────
export interface IEvent {
    title: string;
    description: string;
    category: string;
    date: Date;
    endDate: Date;
    location: string;
    venue: string;
    organizer: Types.ObjectId;
    isPublished: boolean;
    capacity: number;
    imageUrl: string | null;
    tags: string[];
}

export interface IEventDocument extends IEvent, Document {
    createdAt: Date;
    updatedAt: Date;
}

export type IEventModel = Model<IEventDocument>;

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         venue:
 *           type: string
 *         organizer:
 *           type: string
 *         isPublished:
 *           type: boolean
 *         capacity:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

// ─── Schema ──────────────────────────────────────────────
const eventSchema = new Schema<IEventDocument>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
            index: true,
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
        },
        organizer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        imageUrl: {
            type: String,
            default: null,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Indexes ─────────────────────────────────────────────
eventSchema.index({ title: 'text', description: 'text' }); // full-text search
eventSchema.index({ category: 1, date: 1, isPublished: 1 }); // filter + sort
eventSchema.index({ organizer: 1, isPublished: 1 }); // organizer dashboard

// ─── Model ───────────────────────────────────────────────
export const Event = mongoose.model<IEventDocument>('Event', eventSchema);
