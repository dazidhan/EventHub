import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { PaymentStatus } from '../../interfaces/common.js';

// ─── Order Interface ─────────────────────────────────────
export interface IOrder {
    user: Types.ObjectId;
    event: Types.ObjectId;
    ticketType: Types.ObjectId;
    quantity: number;
    totalPrice: number;
    paymentStatus: PaymentStatus;
    paymentId: string | null;
}

export interface IOrderDocument extends IOrder, Document {
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         event:
 *           type: string
 *         ticketType:
 *           type: string
 *         quantity:
 *           type: number
 *         totalPrice:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [PENDING, PAID, FAILED]
 *         paymentId:
 *           type: string
 */

// ─── Order Schema ────────────────────────────────────────
const orderSchema = new Schema<IOrderDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            index: true,
        },
        ticketType: {
            type: Schema.Types.ObjectId,
            ref: 'TicketType',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Must purchase at least 1 ticket'],
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
            index: true,
        },
        paymentId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// ─── Indexes ─────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 }); // order history
orderSchema.index({ event: 1, paymentStatus: 1 }); // analytics
orderSchema.index({ paymentId: 1 }, { sparse: true }); // webhook lookup

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
