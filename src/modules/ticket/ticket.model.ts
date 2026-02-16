import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { TicketTypeEnum } from '../../interfaces/common.js';

// ─── TicketType Interface ────────────────────────────────
export interface ITicketType {
    event: Types.ObjectId;
    name: string;
    type: TicketTypeEnum;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    saleStart: Date;
    saleEnd: Date;
}

export interface ITicketTypeDocument extends ITicketType, Document {
    createdAt: Date;
    updatedAt: Date;
    availableQuantity: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     TicketType:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         event:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [VIP, REGULAR, EARLY_BIRD]
 *         price:
 *           type: number
 *         totalQuantity:
 *           type: number
 *         soldQuantity:
 *           type: number
 *         saleStart:
 *           type: string
 *           format: date-time
 *         saleEnd:
 *           type: string
 *           format: date-time
 */

// ─── TicketType Schema ───────────────────────────────────
const ticketTypeSchema = new Schema<ITicketTypeDocument>(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Ticket name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(TicketTypeEnum),
            required: [true, 'Ticket type is required'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        totalQuantity: {
            type: Number,
            required: [true, 'Total quantity is required'],
            min: [1, 'Must have at least 1 ticket'],
        },
        soldQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        saleStart: {
            type: Date,
            required: [true, 'Sale start date is required'],
        },
        saleEnd: {
            type: Date,
            required: [true, 'Sale end date is required'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Virtual: Available Quantity ─────────────────────────
ticketTypeSchema.virtual('availableQuantity').get(function () {
    return this.totalQuantity - this.soldQuantity;
});

// ─── Indexes ─────────────────────────────────────────────
ticketTypeSchema.index({ event: 1, type: 1 });
ticketTypeSchema.index({ soldQuantity: 1, totalQuantity: 1 });

export const TicketType = mongoose.model<ITicketTypeDocument>(
    'TicketType',
    ticketTypeSchema,
);
