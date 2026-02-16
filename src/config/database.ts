import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase(): Promise<void> {
    try {
        mongoose.connection.on('connected', () => {
            logger.info('📦 MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error({ err }, '❌ MongoDB connection error');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected');
        });

        await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    } catch (error) {
        logger.fatal({ error }, '💀 Failed to connect to MongoDB');
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
    logger.info('📦 MongoDB disconnected gracefully');
}
