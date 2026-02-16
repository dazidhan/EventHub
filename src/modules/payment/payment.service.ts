import { TicketService } from '../ticket/ticket.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { createModuleLogger } from '../../config/logger.js';
import { PaymentStatus } from '../../interfaces/common.js';

const logger = createModuleLogger('payment-service');

export class PaymentService {
    private readonly ticketService: TicketService;

    constructor() {
        this.ticketService = new TicketService();
    }

    /**
     * Simulate a payment webhook callback.
     * In production, this would validate webhook signature and process
     * the payment gateway's callback payload.
     */
    async processWebhook(payload: {
        paymentId: string;
        status: 'success' | 'failed';
        webhookSecret: string;
    }) {
        // Simulate webhook secret validation
        const { env } = await import('../../config/env.js');
        if (payload.webhookSecret !== env.PAYMENT_WEBHOOK_SECRET) {
            throw new NotFoundError('Invalid webhook secret');
        }

        const status =
            payload.status === 'success' ? PaymentStatus.PAID : PaymentStatus.FAILED;

        const order = await this.ticketService.updatePaymentStatus(
            payload.paymentId,
            status,
        );

        if (!order) {
            throw new NotFoundError('Order with specified paymentId');
        }

        logger.info(
            {
                paymentId: payload.paymentId,
                orderId: order._id,
                newStatus: status,
            },
            `💰 Payment webhook processed: ${status}`,
        );

        return { orderId: order._id, paymentStatus: status };
    }

    /**
     * Get payment status for an order.
     */
    async getPaymentStatus(paymentId: string) {
        const { Order } = await import('../ticket/order.model.js');
        const order = await Order.findOne({ paymentId }).select(
            'paymentId paymentStatus totalPrice createdAt',
        );

        if (!order) {
            throw new NotFoundError('Payment');
        }

        return order;
    }
}
