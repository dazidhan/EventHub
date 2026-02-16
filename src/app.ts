import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { globalErrorHandler } from './middlewares/error-handler.js';
import routes from './routes/index.js';

// ─── Create Express App ──────────────────────────────────
const app = express();

// ─── Security Middlewares ────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        errorCode: 'TOO_MANY_REQUESTS',
    },
});
app.use(limiter);

// ─── Body Parsers ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Swagger Documentation ──────────────────────────────
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'EventHub API Documentation',
    }),
);

// ─── API Routes ─────────────────────────────────────────
app.use(env.API_PREFIX, routes);

// ─── 404 Handler ────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        errorCode: 'NOT_FOUND',
    });
});

// ─── Global Error Handler ───────────────────────────────
app.use(globalErrorHandler);

export default app;
