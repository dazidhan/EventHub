import mongoose from 'mongoose';
import { TicketType } from './ticket.model.js';
import { Order, type IOrderDocument } from './order.model.js';
import type { CreateTicketTypeDto, PurchaseTicketDto } from './ticket.validator.js';
import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from '../../utils/errors.js';
import { createModuleLogger } from '../../config/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from '../../interfaces/common.js';

const logger = createModuleLogger('ticket-service');

export class TicketService {
    // ─── Create Ticket Type for Event ──────────────────
    async createTicketType(eventId: string, data: CreateTicketTypeDto) {
        const ticketType = await TicketType.create({
            ...data,
            event: eventId,
        });
        return ticketType;
    }

    // ─── Get Ticket Types for Event ────────────────────
    async getTicketTypes(eventId: string) {
        return TicketType.find({ event: eventId }).sort({ price: 1 });
    }

    // ─── Purchase Ticket (Atomic Transaction) ──────────
    async purchaseTicket(
        userId: string,
        data: PurchaseTicketDto,
    ): Promise<IOrderDocument> {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // 1. Atomically increment soldQuantity with guard condition
            //    This prevents overselling: only succeeds if soldQuantity + qty <= totalQuantity
            const ticketType = await TicketType.findOneAndUpdate(
                {
                    _id: data.ticketTypeId,
                    event: data.eventId,
                    // Guard: ensure enough stock
                    $expr: {
                        $lte: [
                            { $add: ['$soldQuantity', data.quantity] },
                            '$totalQuantity',
                        ],
                    },
                },
                {
                    $inc: { soldQuantity: data.quantity },
                },
                {
                    new: true,
                    session,
                },
            );

            if (!ticketType) {
                // Either ticket not found or sold out
                const exists = await TicketType.findById(data.ticketTypeId).session(session);
                if (!exists) {
                    throw new NotFoundError('Ticket type');
                }
                throw new ConflictError(
                    `Not enough tickets available. Requested: ${data.quantity}, Available: ${exists.totalQuantity - exists.soldQuantity}`,
                );
            }

            // 2. Check sale window
            const now = new Date();
            if (now < ticketType.saleStart || now > ticketType.saleEnd) {
                throw new BadRequestError('Ticket sales are not currently open');
            }

            // 3. Calculate total price
            const totalPrice = ticketType.price * data.quantity;

            // 4. Generate mock payment ID
            const paymentId = `PAY-${uuidv4()}`;

            // 5. Create order
            const order = await Order.create(
                [
                    {
                        user: userId,
                        event: data.eventId,
                        ticketType: data.ticketTypeId,
                        quantity: data.quantity,
                        totalPrice,
                        paymentStatus: PaymentStatus.PENDING,
                        paymentId,
                    },
                ],
                { session },
            );

            await session.commitTransaction();

            logger.info(
                {
                    orderId: order[0]!._id,
                    userId,
                    eventId: data.eventId,
                    quantity: data.quantity,
                    totalPrice,
                    paymentId,
                },
                '🎟️ Ticket purchased successfully',
            );

            return order[0]!;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ─── Get User's Order History ──────────────────────
    async getOrderHistory(userId: string) {
        return Order.find({ user: userId })
            .populate('event', 'title date location')
            .populate('ticketType', 'name type price')
            .sort({ createdAt: -1 });
    }

    // ─── Update Payment Status ────────────────────────
    async updatePaymentStatus(
        paymentId: string,
        status: PaymentStatus,
    ): Promise<IOrderDocument | null> {
        return Order.findOneAndUpdate(
            { paymentId },
            { paymentStatus: status },
            { new: true },
        );
    }
}
