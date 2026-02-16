import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

async function bootstrap(): Promise<void> {
    // Connect to MongoDB
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
        logger.info(
            `🚀 EventHub API server running on http://localhost:${env.PORT}`,
        );
        logger.info(
            `📚 Swagger docs available at http://localhost:${env.PORT}/api-docs`,
        );
        logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // ─── Graceful Shutdown ──────────────────────────────
    const gracefulShutdown = async (signal: string) => {
        logger.info(`\n${signal} received. Starting graceful shutdown...`);

        server.close(async () => {
            logger.info('HTTP server closed');
            await disconnectDatabase();
            logger.info('✅ Graceful shutdown completed');
            process.exit(0);
        });

        // Force shutdown after 10s
        setTimeout(() => {
            logger.error('⚠️ Forced shutdown after timeout');
            process.exit(1);
        }, 10_000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ─── Unhandled Errors ──────────────────────────────
    process.on('unhandledRejection', (reason: Error) => {
        logger.fatal({ err: reason }, '💀 Unhandled Rejection');
        process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
        logger.fatal({ err: error }, '💀 Uncaught Exception');
        process.exit(1);
    });
}

bootstrap().catch((error) => {
    logger.fatal({ error }, '💀 Failed to start server');
    process.exit(1);
});
