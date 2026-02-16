import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EventHub API',
            version: '1.0.0',
            description:
                'Production-ready SaaS API for event management & ticketing. Built with Express.js, TypeScript, and MongoDB.',
            contact: {
                name: 'EventHub Team',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errorCode: { type: 'string' },
                    },
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' },
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.route.ts', './src/modules/**/*.model.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
