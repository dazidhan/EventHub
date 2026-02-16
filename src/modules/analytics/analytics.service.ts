import { Order } from '../ticket/order.model.js';
import { PaymentStatus } from '../../interfaces/common.js';
import mongoose from 'mongoose';

export class AnalyticsService {
    /**
     * Get analytics for a specific event:
     *  - Total tickets sold
     *  - Total revenue
     *  - Breakdown by ticket type
     */
    async getEventAnalytics(eventId: string) {
        const objectId = new mongoose.Types.ObjectId(eventId);

        const [summary, breakdown] = await Promise.all([
            // Overall event stats
            Order.aggregate([
                {
                    $match: {
                        event: objectId,
                        paymentStatus: PaymentStatus.PAID,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalTicketsSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$totalPrice' },
                        totalOrders: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalTicketsSold: 1,
                        totalRevenue: 1,
                        totalOrders: 1,
                    },
                },
            ]),

            // Breakdown by ticket type
            Order.aggregate([
                {
                    $match: {
                        event: objectId,
                        paymentStatus: PaymentStatus.PAID,
                    },
                },
                {
                    $lookup: {
                        from: 'tickettypes',
                        localField: 'ticketType',
                        foreignField: '_id',
                        as: 'ticketInfo',
                    },
                },
                { $unwind: '$ticketInfo' },
                {
                    $group: {
                        _id: '$ticketType',
                        ticketName: { $first: '$ticketInfo.name' },
                        ticketTypeEnum: { $first: '$ticketInfo.type' },
                        ticketsSold: { $sum: '$quantity' },
                        revenue: { $sum: '$totalPrice' },
                    },
                },
                { $sort: { revenue: -1 } },
            ]),
        ]);

        return {
            event: eventId,
            summary: summary[0] ?? {
                totalTicketsSold: 0,
                totalRevenue: 0,
                totalOrders: 0,
            },
            breakdown,
        };
    }

    /**
     * Get overall platform analytics (Admin only):
     *  - Total sales across all events
     *  - Revenue summary
     *  - Top events by revenue
     */
    async getPlatformSummary() {
        const [overall, topEvents, recentSales] = await Promise.all([
            // Overall platform stats
            Order.aggregate([
                { $match: { paymentStatus: PaymentStatus.PAID } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalPrice' },
                        totalTicketsSold: { $sum: '$quantity' },
                        totalOrders: { $sum: 1 },
                    },
                },
                { $project: { _id: 0 } },
            ]),

            // Top 10 events by revenue
            Order.aggregate([
                { $match: { paymentStatus: PaymentStatus.PAID } },
                {
                    $group: {
                        _id: '$event',
                        revenue: { $sum: '$totalPrice' },
                        ticketsSold: { $sum: '$quantity' },
                        totalOrders: { $sum: 1 },
                    },
                },
                { $sort: { revenue: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'eventInfo',
                    },
                },
                { $unwind: '$eventInfo' },
                {
                    $project: {
                        _id: 0,
                        eventId: '$_id',
                        title: '$eventInfo.title',
                        revenue: 1,
                        ticketsSold: 1,
                        totalOrders: 1,
                    },
                },
            ]),

            // Last 30 days daily revenue trend
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: PaymentStatus.PAID,
                        createdAt: {
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        dailyRevenue: { $sum: '$totalPrice' },
                        dailyOrders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        return {
            summary: overall[0] ?? {
                totalRevenue: 0,
                totalTicketsSold: 0,
                totalOrders: 0,
            },
            topEvents,
            recentSales,
        };
    }
}
