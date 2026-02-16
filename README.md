# 🎟️ EventHub API

Production-ready SaaS backend for **event management & ticketing**, built with modern Node.js best practices.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js 22** | Runtime |
| **Express.js 4** | Web framework |
| **TypeScript 5** (strict mode) | Type safety |
| **MongoDB / Mongoose 8** | Database & ODM |
| **Zod** | Schema validation |
| **Pino** | Structured logging |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Swagger (OpenAPI 3.0)** | API documentation |
| **Docker** | Containerization |

## Architecture

```
Controller → Service → Repository → Mongoose Model → MongoDB
```

- **Controller**: HTTP layer — parses request, calls service, returns `ApiResponse`
- **Service**: Business logic, orchestration, transaction management
- **Repository**: Mongoose queries abstracted from business logic
- **Validator**: Zod schemas with inferred DTO types
- **Middleware**: Auth (JWT), validation, error handling, rate limiting

## Folder Structure

```
src/
├── config/              # Environment, DB, Logger, Swagger
│   ├── env.ts           # Zod-validated env config
│   ├── database.ts      # Mongoose connection + retry
│   ├── logger.ts        # Pino structured logging
│   └── swagger.ts       # OpenAPI 3.0 spec
├── interfaces/          # Shared TypeScript types & enums
│   └── common.ts
├── middlewares/          # Express middlewares
│   ├── auth.ts          # JWT verify + role guard
│   ├── error-handler.ts # Global error handler
│   └── validate.ts      # Zod validation middleware
├── modules/
│   ├── auth/            # Register, Login, JWT, Email verify
│   ├── user/            # Profile CRUD, Soft delete
│   ├── event/           # Event CRUD, Publish, Search, Filter
│   ├── ticket/          # Ticket types, Purchase (atomic), Orders
│   ├── payment/         # Mock gateway, Webhook
│   └── analytics/       # Revenue, Sales aggregation
├── routes/
│   └── index.ts         # Central route aggregator
├── utils/
│   ├── response.ts      # ApiResponse formatter
│   ├── errors.ts        # Custom error classes
│   ├── pagination.ts    # Pagination helper
│   └── async-handler.ts # Async error wrapper
├── app.ts               # Express app configuration
└── server.ts            # Bootstrap + graceful shutdown
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev

# TypeScript typecheck
npm run typecheck

# Production build
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register user |
| POST | `/api/v1/auth/login` | — | Login |
| POST | `/api/v1/auth/refresh` | — | Refresh token |
| GET | `/api/v1/auth/verify-email/:token` | — | Verify email |
| POST | `/api/v1/auth/logout` | ✅ | Logout |
| GET | `/api/v1/users/me` | ✅ | Get profile |
| PATCH | `/api/v1/users/me` | ✅ | Update profile |
| DELETE | `/api/v1/users/me` | ✅ | Soft delete |
| POST | `/api/v1/events` | Organizer | Create event |
| GET | `/api/v1/events` | — | List events (paginated) |
| GET | `/api/v1/events/:id` | — | Event detail |
| PATCH | `/api/v1/events/:id` | Organizer | Update event |
| DELETE | `/api/v1/events/:id` | Organizer | Delete event |
| PATCH | `/api/v1/events/:id/publish` | Organizer | Publish/unpublish |
| POST | `/api/v1/events/:eventId/ticket-types` | Organizer | Create ticket type |
| GET | `/api/v1/events/:eventId/ticket-types` | — | List ticket types |
| POST | `/api/v1/orders` | ✅ | Purchase ticket |
| GET | `/api/v1/orders/me` | ✅ | Order history |
| POST | `/api/v1/payments/webhook` | — | Mock webhook |
| GET | `/api/v1/payments/:paymentId/status` | ✅ | Payment status |
| GET | `/api/v1/analytics/events/:eventId` | Organizer | Event analytics |
| GET | `/api/v1/analytics/summary` | Admin | Platform analytics |
| GET | `/api/v1/health` | — | Health check |

## Swagger Docs

Visit `http://localhost:5000/api-docs` after starting the server.

## Docker

```bash
docker build -t eventhub-api .
docker run -p 5000:5000 --env-file .env eventhub-api
```

## Industry Best Practices (2026)

- **Layered architecture** with clear separation of concerns
- **TypeScript strict mode** (`noUnusedLocals`, `noImplicitReturns`, etc.)
- **Zod-validated environment** — fail-fast on bad config
- **MongoDB transactions** for atomic ticket purchases (prevents overselling)
- **Compound indexes** for optimized queries
- **Structured logging** with Pino (JSON in production, pretty in dev)
- **Centralized error handling** — catches Zod, Mongoose, and custom errors
- **Rate limiting & Helmet** — production security defaults
- **Multi-stage Docker build** — minimal production image with non-root user
- **Graceful shutdown** — handles SIGTERM/SIGINT with proper cleanup
- **OpenAPI documentation** — auto-generated from JSDoc annotations

## License

ISC
