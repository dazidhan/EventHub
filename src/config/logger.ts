import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
    level: env.LOG_LEVEL,
    transport:
        env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            }
            : undefined,
    base: {
        service: 'eventhub-api',
        env: env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
});

/**
 * Create a child logger scoped to a specific module.
 */
export function createModuleLogger(moduleName: string) {
    return logger.child({ module: moduleName });
}
