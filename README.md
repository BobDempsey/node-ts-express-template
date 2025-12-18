# Node.js TypeScript Express Template

[![Test](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml)
[![Build](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml)
[![Biome Lint and Format](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml)
[![codecov](https://codecov.io/gh/BobDempsey/node-ts-template/branch/main/graph/badge.svg)](https://codecov.io/gh/BobDempsey/node-ts-template)

A production-ready Node.js project template with TypeScript and Express.js support.

### Live Demo

Try the live demo at: [https://node-ts-express-template.onrender.com/](https://node-ts-express-template.onrender.com/)

## Features

- ⚡ **Express.js** - Fast, unopinionated web framework with TypeScript support
- 🚀 **TypeScript** - Full TypeScript support with strict type checking
- 🔄 **Hot Reload** - Automatic restart on file changes during development
- 📦 **Modern Node.js** - Targets ES2020 and Node.js 22+
- 🛠️ **Development Ready** - Pre-configured build and development scripts
- 🔒 **Type-Safe Environment** - Zod-based environment variable validation and type safety
- 🧪 **Testing Suite** - Jest and Supertest for comprehensive unit and integration testing
- 🎨 **Code Quality** - Biome for fast linting and formatting
- 🪝 **Pre-commit Hooks** - Husky and lint-staged for automatic code quality checks
- 📝 **Pino Logging** - Structured JSON logging with Pino, pretty-print in dev, automatic sensitive field redaction
- 🔍 **Request Tracing** - Automatic UUID generation and X-Request-Id header for distributed tracing
- 🛡️ **Security Headers** - Helmet middleware pre-configured for HTTP security
- 🌐 **CORS Support** - Pre-configured CORS with environment-based origin control
- 🛡️ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Request Validation** - Built-in Zod-based validation middleware for request body, params, and query
- 🏥 **Health Check Endpoints** - Built-in /health, /ready, and /live endpoints for monitoring
- 🔐 **JWT Authentication** - Optional JWT-based auth with feature flag, refresh tokens, and pluggable user service
- 🔢 **API Versioning** - Organized route structure with v1 API endpoints and example routes
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation at `/docs`
- ⚡ **Async Handler** - Built-in utility for automatic async error handling
- 🔄 **Graceful Shutdown** - Multi-signal handling (SIGTERM/SIGINT/SIGHUP) with configurable timeout for zero-downtime deployments
- 🐳 **Docker Ready** - Multi-stage Dockerfile and docker-compose.yml included for containerized deployments
- 🚦 **Rate Limiting** - Built-in request rate limiting with configurable limits and IP-based throttling
- 📦 **API Response Envelope** - Standardized response utilities for consistent API responses
- 🔭 **Sentry Integration** - Optional error tracking, performance monitoring, and profiling with Sentry
- 🚢 **Production Ready** - Structured logging, error handling, and cloud-native features

## Quick Start

Get up and running in 60 seconds:

```bash
# 1. Clone or download this template
git clone <your-repo-url>
cd node-ts-express-template

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Test the API
curl http://localhost:3000
# Response: Hello, TypeScript Node.js World!
```

The server will start on `http://localhost:3000` with hot reload enabled. Make changes to your code and the server will automatically restart.

**Quick Start with Docker:**
```bash
# Run with docker-compose
docker-compose up

# Or build and run manually
docker build -t node-ts-express-template .
docker run -p 3000:3000 node-ts-express-template
```

**Next Steps:**
- Add your routes in `src/routes/v1/` for versioned API endpoints
- Configure environment variables in `.env`
- Run tests with `npm test`
- Build for production with `npm run build`
- Deploy with Docker (see Docker Deployment section)

## Project Structure

```
node-ts-express-template/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD workflows
│       ├── test.yml        # Test workflow with coverage
│       ├── build.yml       # Build validation workflow
│       └── biome.yml       # Code quality workflow
├── .husky/                 # Git hooks configuration
├── .vscode/                # VS Code workspace settings
│   ├── extensions.json     # Recommended extensions
│   └── settings.json       # Editor settings
├── src/
│   ├── lib/
│   │   ├── env.ts          # Environment variable schema and validation
│   │   ├── try-parse-env.ts # Zod environment parsing utility
│   │   ├── logger.ts       # Pino-based structured logger
│   │   ├── jwt.ts          # JWT token generation and verification
│   │   └── constants.ts    # Application constants
│   ├── middleware/
│   │   ├── index.ts        # Middleware exports
│   │   ├── error-handler.ts # Centralized error handling
│   │   ├── request-logger.ts # Request logging with tracing
│   │   ├── validate.ts      # Request validation with Zod
│   │   ├── rate-limiter.ts  # Rate limiting middleware
│   │   └── auth.ts          # JWT authentication middleware
│   ├── errors/
│   │   ├── index.ts        # Error class exports
│   │   ├── app-error.ts    # Base error class
│   │   ├── validation-error.ts # Validation error class
│   │   ├── not-found-error.ts # Not found error class
│   │   └── unauthorized-error.ts # Unauthorized error class
│   ├── routes/
│   │   ├── index.ts        # Route aggregator
│   │   ├── health.routes.ts # Health check endpoints
│   │   └── v1/             # API v1 routes
│   │       ├── index.ts    # v1 route aggregator
│   │       ├── example.routes.ts # Example v1 endpoints
│   │       └── auth.routes.ts # Authentication endpoints
│   ├── services/
│   │   ├── index.ts        # Service exports
│   │   ├── user.service.ts # User service interface
│   │   └── user.service.stub.ts # Stub user service for testing
│   ├── types/
│   │   └── express.d.ts    # Express type extensions
│   ├── docs/
│   │   └── swagger.ts      # Swagger/OpenAPI configuration
│   ├── utils/
│   │   ├── index.ts        # Utility exports
│   │   ├── async-handler.ts # Async route error wrapper
│   │   └── api-response.ts  # Standardized API response utilities
│   ├── app.ts              # Express app configuration and middleware setup
│   └── index.ts            # Server startup and lifecycle management
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── rest/               # API testing files
│   │   ├── requests.http   # VS Code REST Client requests
│   │   └── postman_collection.json  # Postman collection
│   └── setup/              # Test configuration and utilities
│       ├── jest.setup.ts   # Jest global setup
│       └── test-utils.ts   # Test helper utilities
├── coverage/               # Test coverage reports (auto-generated)
├── dist/                   # Compiled JavaScript output (auto-generated)
├── node_modules/           # Dependencies
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── biome.json              # Biome linter and formatter configuration
├── jest.config.ts          # Jest testing configuration
├── package.json            # Project configuration
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration for development
├── tsconfig.build.json     # TypeScript configuration for production builds
├── Dockerfile              # Multi-stage Docker build configuration
├── docker-compose.yml      # Docker Compose configuration for local development
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. Clone or download this template
2. Navigate to the project directory
3. Install dependencies:

   ```bash
   npm install
   ```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

This will start the server on `http://localhost:3000` and automatically restart when you make changes to the code.

## Working with Express

### Basic Server Structure

The template uses a clean separation between app configuration and server lifecycle:

**`src/app.ts`** - Express app configuration:
```typescript
import express, { type Request, type Response } from "express"
import helmet from "helmet"
import cors from "cors"
import { requestLogger, errorHandler } from "@/middleware"
import routes from "@/routes"

const app = express()

// Middleware
app.use(helmet())                          // Security headers
app.use(cors(corsOptions))                 // CORS configuration
app.use(express.json())                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }))  // Parse URL-encoded bodies
app.use(requestLogger)                     // Request logging with tracing

// Routes
app.use(routes)                            // API routes
app.get("/", (_req, res) => res.send(GREETING))

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})

// Centralized error handler (must be last)
app.use(errorHandler)

export { app }
```

**`src/index.ts`** - Server startup and lifecycle:
```typescript
import { app } from "@/app"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

const PORT = env.PORT ?? 3000

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`)
  logger.info(`📁 Environment: ${env.NODE_ENV || "development"}`)
})

// Handle server errors
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${PORT} is already in use`)
    process.exit(1)
  }
  logger.error(`❌ Server error: ${err.message}`)
  process.exit(1)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("🔄 SIGTERM received, shutting down gracefully...")
  server.close(() => {
    logger.info("✅ Process terminated")
    process.exit(0)
  })
})
```

**Benefits of This Structure:**

- **Testability**: Import `app` directly in tests without starting the server
- **Separation of Concerns**: App configuration separate from server lifecycle
- **Reusability**: Use the same app in different contexts (testing, serverless, etc.)
- **Production-Ready**: Proper error handling and graceful shutdown built-in

### Adding New Routes

This template uses a modular routing structure with API versioning. Add your routes in the `src/routes/v1/` directory:

**Step 1: Create a new route module**

```typescript
// src/routes/v1/users.routes.ts
import { Router, type Request, type Response } from "express"
import { asyncHandler } from "@/utils"

const router = Router()

// GET /api/v1/users
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  // Async operations are automatically wrapped for error handling
  const users = await fetchUsers()
  res.json({ users })
}))

// POST /api/v1/users
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body
  const newUser = await createUser(userData)
  res.status(201).json({ message: "User created", data: newUser })
}))

export default router
```

**Step 2: Register the route in the v1 aggregator**

```typescript
// src/routes/v1/index.ts
import { Router } from "express"
import exampleRoutes from "./example.routes"
import userRoutes from "./users.routes"  // Add this line

const router = Router()

router.use("/", exampleRoutes)
router.use("/users", userRoutes)  // Add this line

export default router
```

Your new routes are now available at `/api/v1/users`!

#### API Versioning Structure

The template includes an organized routing structure for API versioning:

```
Routes:
├── /health                 # Health check (unversioned)
├── /ready                  # Readiness check (unversioned)
├── /live                   # Liveness check (unversioned)
└── /api/v1/               # Version 1 API
    ├── /                   # Returns greeting
    ├── /example            # Example JSON response
    ├── /async-example      # Example async route
    └── /async-error-example # Example error handling
```

The example routes in `src/routes/v1/example.routes.ts` demonstrate:
- Basic route handlers
- Async route handlers with `asyncHandler`
- Error handling in async routes
- JSON responses with timestamps

These can be used as templates for your own routes or removed once you've added your own endpoints.

### Middleware

Express middleware is already configured for common use cases:

- **Security headers**: `helmet()` - Adds security headers to protect against common vulnerabilities
- **JSON parsing**: `express.json()` - Automatically parses JSON request bodies
- **URL-encoded parsing**: `express.urlencoded({ extended: true })` - Handles form data

Add custom middleware:

```typescript
// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Authentication middleware
const authMiddleware = (req: Request, res: Response, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route" })
})
```

### Error Handling

Express provides powerful error handling capabilities. The template includes a basic 404 handler, but you can add more sophisticated error handling.

#### Global Error Handler

Add a global error handler to catch all errors (must be added AFTER all routes and middleware):

```typescript
// Error handling middleware (add before the 404 handler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`)
  logger.error(err.stack || "")

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  })
})

// 404 handler (must be last)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})
```

#### Async Error Handling

This template includes a built-in `asyncHandler` utility for handling async route errors. It automatically catches promise rejections and forwards them to the error handling middleware.

**Option 1: Use asyncHandler (Recommended)**

```typescript
import { asyncHandler } from "@/utils"

// asyncHandler automatically catches errors from async operations
app.get("/api/users/:id", asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id)
  if (!user) {
    throw new NotFoundError("User not found")  // Caught automatically
  }
  res.json(user)
}))
```

**Option 2: Manual Try-Catch**

```typescript
app.get("/api/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    next(error) // Pass to error handler
  }
})
```

The `asyncHandler` utility is available in `src/utils/async-handler.ts` and can be imported from `@/utils`.

#### Custom Error Classes

This template includes pre-built error classes for common HTTP errors:

```typescript
import { NotFoundError, ValidationError, UnauthorizedError } from "@/errors"
import { asyncHandler } from "@/utils"

// Example usage with asyncHandler
app.get("/api/users/:id", asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id)
  if (!user) {
    throw new NotFoundError("User not found")  // Returns 404
  }
  res.json(user)
}))

app.post("/api/users", asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) {
    throw new ValidationError("Email is required")  // Returns 400
  }
  const user = await createUser(req.body)
  res.status(201).json(user)
}))

app.get("/api/protected", asyncHandler(async (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    throw new UnauthorizedError("Authentication required")  // Returns 401
  }
  res.json({ data: "Protected resource" })
}))
```

**Available Error Classes:**

- `AppError` - Base error class (in `src/errors/app-error.ts`)
- `NotFoundError` - 404 errors (in `src/errors/not-found-error.ts`)
- `ValidationError` - 400 validation errors (in `src/errors/validation-error.ts`)
- `UnauthorizedError` - 401 authentication errors (in `src/errors/unauthorized-error.ts`)

All errors are automatically handled by the centralized error handler middleware in `src/middleware/error-handler.ts`.

### Common Express Patterns

#### Request Validation

This template includes built-in request validation middleware powered by Zod. Validate request body, params, or query parameters with type safety:

```typescript
import { z } from "zod"
import { validate } from "@/middleware"

// Define validation schema
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).optional()
})

// Validate request body (default)
app.post("/api/users", validate(CreateUserSchema), (req, res) => {
  // req.body is now typed and validated
  const { name, email, age } = req.body
  res.status(201).json({ message: "User created", data: { name, email, age } })
})

// Validate URL parameters
const UserIdSchema = z.object({
  id: z.string().uuid()
})

app.get("/api/users/:id", validate(UserIdSchema, "params"), (req, res) => {
  // req.params is validated
  const { id } = req.params
  res.json({ userId: id })
})

// Validate query parameters
const SearchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1)
})

app.get("/api/search", validate(SearchSchema, "query"), (req, res) => {
  // req.query is validated with type coercion and defaults applied
  const { q, limit, page } = req.query
  res.json({ query: q, limit, page })
})
```

The validation middleware:
- Validates data against Zod schemas
- Applies type coercion and default values
- Returns formatted error messages on validation failure
- Throws `ValidationError` that's handled by the error handler
- Supports validation of `body`, `params`, and `query`

#### Structured Responses (API Response Envelope)

This template includes built-in utilities for standardized API responses in `src/utils/api-response.ts`. All responses follow a consistent envelope format for easy client-side handling.

**Response Envelope Format:**

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T                    // Present on success
  error?: {                   // Present on error
    message: string
    code: string
    statusCode: number
    details?: Record<string, unknown>
  }
  meta: {
    timestamp: string         // ISO 8601 timestamp
    requestId?: string        // For request correlation
    pagination?: {            // For paginated responses
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

**Using the Built-in Utilities:**

```typescript
import { sendSuccess, sendError } from "@/utils/api-response"
import { asyncHandler } from "@/utils"

// Success response
router.get("/users", asyncHandler(async (req, res) => {
  const users = await getUsers()
  sendSuccess(res, users)
  // Response: { success: true, data: [...], meta: { timestamp: "..." } }
}))

// Success with custom status code
router.post("/users", asyncHandler(async (req, res) => {
  const user = await createUser(req.body)
  sendSuccess(res, user, 201)
  // Response: { success: true, data: {...}, meta: { timestamp: "..." } }
}))

// Success with pagination metadata
router.get("/users", asyncHandler(async (req, res) => {
  const { users, total } = await getPaginatedUsers(req.query)
  sendSuccess(res, users, 200, {
    pagination: { page: 1, limit: 10, total, totalPages: Math.ceil(total / 10) }
  })
}))

// Error response
router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id)
  if (!user) {
    sendError(res, "User not found", "USER_NOT_FOUND", 404)
    return
  }
  sendSuccess(res, user)
}))

// Error with additional details
router.post("/users", asyncHandler(async (req, res) => {
  if (!isValidEmail(req.body.email)) {
    sendError(res, "Validation failed", "VALIDATION_ERROR", 400, {
      field: "email",
      reason: "Invalid email format"
    })
    return
  }
  // ...
}))
```

**Example Responses:**

Success:
```json
{
  "success": true,
  "data": { "id": "123", "name": "John Doe", "email": "john@example.com" },
  "meta": { "timestamp": "2025-12-07T10:30:45.123Z" }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "statusCode": 404
  },
  "meta": { "timestamp": "2025-12-07T10:30:45.123Z" }
}
```

The response utilities are in `src/utils/api-response.ts` and exported from `@/utils`.

#### Controller Pattern

Separate route handlers from routing logic:

```typescript
// src/controllers/user.controller.ts
import type { Request, Response, NextFunction } from "express"

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await getUsers()
      res.json(successResponse(users))
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getUserById(req.params.id)
      if (!user) {
        throw new NotFoundError("User not found")
      }
      res.json(successResponse(user))
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await createUser(req.body)
      res.status(201).json(successResponse(user, "User created"))
    } catch (error) {
      next(error)
    }
  }
}

// src/routes/user.routes.ts
import { Router } from "express"
import { UserController } from "@/controllers/user.controller"

const router = Router()
const userController = new UserController()

router.get("/", userController.getAll)
router.get("/:id", userController.getById)
router.post("/", userController.create)

export default router

// src/index.ts
import userRoutes from "@/routes/user.routes"
app.use("/api/users", userRoutes)
```

#### Request Logging

This template includes built-in request logging using **Pino**, a high-performance JSON logger. The middleware is already configured in `src/app.ts` and tracks:

- HTTP method and path
- Response status code
- Response time in milliseconds
- Unique request ID for tracing
- User agent and IP address

**Key Features:**

- **Pino-based**: High-performance structured logging
- **Pretty-print in development**: Readable, colorized output via `pino-pretty`
- **JSON in production**: Optimized for log aggregation services
- **Automatic field redaction**: Sensitive data (authorization headers, cookies, passwords) is automatically redacted
- **Request-scoped logger**: Each request gets a child logger with request context

**Development Mode (Pretty-printed):**
```
[10:30:45.123] INFO: GET /api/v1/users 200 45ms
    requestId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    method: "GET"
    path: "/api/v1/users"
    statusCode: 200
    duration: 45
```

**Production Mode (Structured JSON):**
```json
{"level":30,"time":1733567445123,"requestId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","method":"GET","path":"/api/v1/users","statusCode":200,"duration":45,"userAgent":"Mozilla/5.0...","ip":"::1","msg":"GET /api/v1/users 200 45ms"}
```

**Using the Request-Scoped Logger:**

Each request has a child logger attached to `req.log` with the request ID automatically included. This is the recommended way to log within route handlers:

```typescript
import { asyncHandler } from "@/utils"

router.get("/users", asyncHandler(async (req, res) => {
  // Use req.log for request-scoped logging
  req.log.info("Fetching users from database")

  const users = await getUsers()
  req.log.debug({ count: users.length }, "Users retrieved")

  res.json({ users })
}))
```

All logs from `req.log` automatically include the `requestId` for easy correlation.

**Using the Global Logger:**

For logging outside of request handlers (startup, background tasks, etc.), use the global logger:

```typescript
import { logger } from "@/lib/logger"

// Simple message
logger.info("Server starting...")

// With additional context
logger.info({ port: 3000, env: "production" }, "Server configuration")

// Error logging with stack trace
logger.error({ err: error }, "Failed to connect to database")
```

**Available Log Levels:** `trace`, `debug`, `info`, `warn`, `error`, `fatal`

**Configuring Log Level:**

Set the log level via environment variable:

```bash
LOG_LEVEL=debug  # Default: debug in development, info in production
```

**Automatic Field Redaction:**

The logger automatically redacts sensitive fields to prevent accidental logging of secrets:

- `req.headers.authorization` - Bearer tokens, API keys
- `req.headers.cookie` - Session cookies
- `password` - User passwords

These fields appear as `[REDACTED]` in logs.

#### Request Tracing

Every HTTP request is automatically assigned a unique identifier (UUID) for distributed tracing and debugging. This feature is built into the request logging middleware.

**How It Works:**

1. **Unique Request ID**: Each request gets a UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
2. **Response Header**: The ID is added to the response as `X-Request-Id` header
3. **Logging**: The ID appears in all request logs for correlation
4. **Programmatic Access**: Access the ID in your handlers via `req.id`

**Viewing Request IDs:**

Check response headers in your browser DevTools or curl:

```bash
curl -I http://localhost:3000/api/v1/example

# Response includes:
# X-Request-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Using Request IDs in Your Code:**

```typescript
import { asyncHandler } from "@/utils"
import { logger } from "@/lib/logger"

app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const requestId = (req as any).id

  logger.info(`[${requestId}] Fetching user ${req.params.id}`)

  const user = await getUserById(req.params.id)

  if (!user) {
    logger.warn(`[${requestId}] User ${req.params.id} not found`)
    throw new NotFoundError("User not found")
  }

  res.json({ user })
}))
```

**Benefits:**

- **Distributed Tracing**: Track requests across multiple services
- **Debugging**: Correlate logs for a specific request
- **Monitoring**: Link frontend errors to backend logs
- **Support**: Customers can provide request IDs when reporting issues

Request IDs are especially valuable in production environments with high traffic or microservice architectures.

#### Pagination

Implement pagination for large datasets:

```typescript
// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  return { limit, offset }
}

app.get("/api/users", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10

  const { limit: paginationLimit, offset } = paginate(page, limit)

  const users = await getUsers(paginationLimit, offset)
  const total = await getUserCount()

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})
```

### Express Best Practices

#### Security Headers

The template comes with **Helmet** pre-installed and configured to protect against common web vulnerabilities. Helmet sets secure HTTP headers including:

- **Content-Security-Policy** - Controls which resources can be loaded
- **X-Content-Type-Options** - Prevents MIME type sniffing
- **X-Frame-Options** - Protects against clickjacking
- **Strict-Transport-Security** - Enforces HTTPS connections
- **X-DNS-Prefetch-Control** - Controls DNS prefetching
- **Referrer-Policy** - Controls referrer information

Helmet is already configured in `src/index.ts`:

```typescript
import helmet from "helmet"

app.use(helmet())  // Already included in the template
```

You can customize Helmet's configuration if needed:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://trusted-cdn.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
)
```

To verify security headers are working, check the response headers in your browser's developer tools or use the test requests in `tests/rest/requests.http`.

#### CORS Configuration

This template comes with **CORS pre-configured** using the `cors` package. The configuration automatically adapts based on your environment.

**Default Configuration** (in `src/app.ts`):

```typescript
const corsOptions = {
  origin: env.CORS_ORIGIN ?? true, // Uses CORS_ORIGIN env var, or allows all in development
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Request-Id"], // Expose request tracing header
  maxAge: 86400 // Cache preflight requests for 24 hours
}
app.use(cors(corsOptions))
```

**Environment-Based Configuration:**

Set the `CORS_ORIGIN` environment variable to control allowed origins:

```bash
# Development - Allow multiple local origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Production - Restrict to your domains
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

If `CORS_ORIGIN` is not set, the template allows all origins in development (`origin: true`).

**Custom CORS Configuration:**

To customize CORS settings, edit `src/app.ts`:

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["https://app.com", "https://admin.app.com"]
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  maxAge: 86400
}
app.use(cors(corsOptions))
```

**Testing CORS:**

Use the included REST Client file at `tests/rest/requests.http` to test CORS headers.

#### Rate Limiting

This template includes built-in rate limiting using `express-rate-limit`. It's already configured and enabled in `src/app.ts`.

**Default Configuration:**

- **Window**: 60 seconds (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests**: 100 per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Excluded Paths**: `/health`, `/ready`, `/live`, `/docs` (always accessible)
- **Response**: JSON error with `429` status code

**Environment Variables:**

```bash
# Customize rate limiting (optional)
RATE_LIMIT_WINDOW_MS=60000    # 1 minute window (default)
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests per window (default)
```

**Rate Limit Response:**

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "statusCode": 429
}
```

**Adding Stricter Limits for Specific Routes:**

For routes that need stricter limits (like authentication), create a custom limiter:

```typescript
import rateLimit from "express-rate-limit"

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { error: "Too many login attempts, please try again later." }
})

app.post("/api/auth/login", authLimiter, (req, res) => {
  // Login logic
})
```

The rate limiter implementation is in `src/middleware/rate-limiter.ts` and can be customized as needed.

#### JWT Authentication

This template includes optional JWT-based authentication that can be enabled via a feature flag. When enabled, it provides:

- **Access tokens** - Short-lived tokens (default: 1 hour) for API requests
- **Refresh tokens** - Long-lived tokens (default: 7 days) for obtaining new access tokens
- **Auth middleware** - Automatically protects routes and attaches user info to requests
- **Pluggable user service** - Interface-based design for easy database integration

**Enabling JWT Auth:**

Set these environment variables:

```bash
# Enable JWT authentication
ENABLE_JWT_AUTH=true

# Secret key for signing tokens (min 32 characters, required when auth is enabled)
JWT_SECRET=your-super-secret-key-at-least-32-chars

# Token expiry (optional, defaults shown)
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
```

**Available Endpoints (when enabled):**

- `POST /api/v1/auth/login` - Authenticate with email/password, returns tokens
- `POST /api/v1/auth/refresh` - Exchange refresh token for new access token
- `GET /api/v1/auth/me` - Get current user info (requires valid access token)

**Test Credentials (stub user service):**

```
Email: test@example.com
Password: password123
```

**Using Authentication in Routes:**

When JWT auth is enabled, routes are automatically protected. Access user info via `req.user`:

```typescript
import { asyncHandler } from "@/utils"

router.get("/profile", asyncHandler(async (req, res) => {
  // req.user is populated by auth middleware
  const { userId, email } = req.user!
  res.json({ userId, email })
}))
```

**Path Exclusions:**

These paths are excluded from authentication by default:
- `/health`, `/ready`, `/live` - Health check endpoints
- `/docs` - Swagger documentation
- `/api/v1/auth/*` - Auth endpoints (login, refresh)
- `/` - Root endpoint

**Implementing a Real User Service:**

The template includes a stub user service for development. To use a real database:

1. Create your implementation:

```typescript
// src/services/user.service.postgres.ts
import { db } from '../lib/db'
import bcrypt from 'bcrypt'
import type { UserService } from './user.service'

export const postgresUserService: UserService = {
  findByEmail: (email) => db.user.findUnique({ where: { email } }),
  validatePassword: (user, password) => bcrypt.compare(password, user.passwordHash),
  findById: (id) => db.user.findUnique({ where: { id } }),
}
```

2. Update the export in `src/services/index.ts`:

```typescript
export { postgresUserService as userService } from './user.service.postgres'
```

#### Request Body Size Limits

Prevent denial of service attacks by limiting request body size:

```typescript
import express from "express"

app.use(express.json({ limit: "10mb" })) // Limit JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // Limit URL-encoded
```

#### Input Sanitization

Sanitize user input to prevent injection attacks:

```bash
npm install express-mongo-sanitize
npm install express-validator
```

```typescript
import mongoSanitize from "express-mongo-sanitize"
import { body, validationResult } from "express-validator"

// Prevent MongoDB injection
app.use(mongoSanitize())

// Validate and sanitize inputs
app.post(
  "/api/users",
  [
    body("email").isEmail().normalizeEmail(),
    body("name").trim().escape(),
    body("age").optional().isInt({ min: 0, max: 150 })
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // Process validated data
  }
)
```

#### Environment-Based Configuration

Use different settings for different environments:

```typescript
// src/config/app.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",

  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost"
  },

  security: {
    enableCors: process.env.ENABLE_CORS === "true",
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== "false"
  }
}

// Usage
import { config } from "@/config/app"

if (config.security.enableCors) {
  app.use(cors())
}

if (config.security.rateLimitEnabled) {
  app.use(limiter)
}
```

#### Health Check Endpoints

This template includes built-in health check endpoints for monitoring and orchestration:

**Available Endpoints:**

- **`GET /health`** - Basic health check
  - Always returns 200 if the service is running
  - Response: `{"status": "ok", "timestamp": "..."}`

- **`GET /ready`** - Readiness check
  - Verifies if the service is ready to accept requests
  - Used by load balancers and orchestrators
  - Response: `{"status": "ready", "timestamp": "..."}`

- **`GET /live`** - Liveness check
  - Verifies if the service is alive and functioning
  - Used by Kubernetes for pod health monitoring
  - Response: `{"status": "alive", "timestamp": "..."}`

**Usage:**

```bash
# Check service health
curl http://localhost:3000/health

# Check readiness (for load balancers)
curl http://localhost:3000/ready

# Check liveness (for Kubernetes)
curl http://localhost:3000/live
```

These endpoints are defined in `src/routes/health.routes.ts` and can be customized to check database connections, external dependencies, or other service-specific requirements.

#### API Documentation (Swagger)

This template includes interactive API documentation powered by Swagger/OpenAPI. Access the documentation at `http://localhost:3000/docs` when the server is running.

**Features:**

- **Interactive UI** - Test API endpoints directly from your browser
- **Auto-Generated** - Documentation generated from JSDoc annotations in route files
- **OpenAPI 3.0** - Standard specification for API documentation
- **Try It Out** - Execute requests and see responses in real-time

**Viewing Documentation:**

```bash
# Start the server
npm run dev

# Open in browser
http://localhost:3000/docs
```

**Adding Documentation to New Routes:**

Add `@openapi` JSDoc annotations to your route handlers:

```typescript
/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Returns a list of all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get("/users", (req, res) => {
  res.json([{ id: "1", name: "John" }])
})
```

The Swagger configuration is in `src/docs/swagger.ts` and automatically scans route files in `src/routes/` for `@openapi` annotations.

### Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates optimized JavaScript files in the `dist/` directory.

### Production

Run the compiled JavaScript in production:

```bash
npm start
```

## Production Deployment

This template is production-ready with features designed for containerized deployments, cloud platforms, and high-traffic environments.

### Graceful Shutdown

The server handles termination signals gracefully, ensuring zero-downtime deployments with robust error handling:

**Signals Handled:**
- `SIGTERM` - Standard termination signal (Kubernetes, Docker)
- `SIGINT` - Interrupt signal (Ctrl+C)
- `SIGHUP` - Hangup signal (terminal closed)

**Additional Safety Features:**
- `uncaughtException` - Catches unhandled exceptions and shuts down safely
- `unhandledRejection` - Catches unhandled promise rejections
- **Forced Shutdown Timeout** - If graceful shutdown takes too long, forces exit

**How It Works:**

1. **Signal Received**: SIGTERM, SIGINT, or SIGHUP is received
2. **Stop Accepting Requests**: Server stops accepting new connections
3. **Drain Connections**: Waits for existing requests to complete
4. **Timeout Protection**: If shutdown exceeds `SHUTDOWN_TIMEOUT_MS`, forces exit
5. **Clean Exit**: Process exits with code 0 (or 1 on timeout/error)

**Configuration:**

Set the shutdown timeout via environment variable:

```bash
# Default is 30 seconds (30000ms)
SHUTDOWN_TIMEOUT_MS=30000
```

**Benefits:**

- **Zero Downtime**: No dropped requests during deployments
- **Kubernetes-Ready**: Works with rolling updates and pod lifecycle
- **Docker-Optimized**: Handles container stop signals properly
- **Load Balancer Compatible**: Allows health checks to fail before shutdown
- **Crash Protection**: Handles unexpected errors gracefully
- **Timeout Safety**: Prevents indefinite hangs during shutdown

**Testing Graceful Shutdown:**

```bash
# Start the server
npm start

# In another terminal, send SIGTERM
kill -TERM $(lsof -t -i:3000)

# You'll see:
# SIGTERM received, shutting down gracefully...
# Server closed, all connections finished

# Or send SIGINT (Ctrl+C in the terminal running the server)
```

### Structured Logging

The template automatically switches to structured JSON logging in production for compatibility with log aggregation services.

**Development Logs (Human-Readable):**

```
[2025-12-07T10:30:45.123Z] INFO: 🚀 Server is running on http://localhost:3000
[2025-12-07T10:30:45.125Z] INFO: 📁 Environment: development
✅ GET /api/v1/users 200 - 45ms [a1b2c3d4-e5f6-7890-abcd-ef1234567890]
```

**Production Logs (Structured JSON):**

```json
{"requestId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","method":"GET","path":"/api/v1/users","statusCode":200,"duration":45,"timestamp":"2025-12-07T10:30:45.123Z"}
```

**Compatible With:**

- AWS CloudWatch Logs
- Google Cloud Logging
- Azure Monitor
- Sentry
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- New Relic

The structured format makes it easy to filter, search, and analyze logs at scale.

### Environment Configuration

For production deployments, set these environment variables:

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

**Important:**
- Always set `NODE_ENV=production` to enable optimizations
- Explicitly configure `CORS_ORIGIN` for security (don't rely on defaults)
- Use secrets management for sensitive variables (AWS Secrets Manager, Kubernetes Secrets, etc.)

### Docker Deployment

This template includes production-ready Docker configuration with multi-stage builds for optimal image size and security.

#### Quick Start with Docker

```bash
# Build the image
docker build -t node-ts-express-template .

# Run the container
docker run -p 3000:3000 node-ts-express-template

# Or use docker-compose
docker-compose up
```

#### Multi-Stage Dockerfile

The included `Dockerfile` uses a multi-stage build process for optimal performance and security:

**Stage 1: Builder** - Installs all dependencies and builds TypeScript
- Uses Node.js 24 Alpine for smaller image size
- Supports npm, pnpm, and yarn package managers
- Compiles TypeScript to JavaScript
- Includes all dev dependencies needed for building

**Stage 2: Runtime** - Production-ready runtime image
- Only includes production dependencies
- Copies built artifacts from builder stage
- Runs as Node.js process (not npm start)
- Significantly smaller final image size

**Benefits:**
- **Smaller Images**: Runtime image only contains production code and dependencies
- **Faster Builds**: Docker layer caching optimizes rebuild times
- **Security**: No dev dependencies or source code in production image
- **Flexibility**: Automatically detects and uses your package manager (npm/pnpm/yarn)

#### Docker Compose

The `docker-compose.yml` provides a simple way to run the application:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: node-ts-express-template:dev
    environment:
      - NODE_ENV=development
      - PORT=3000
    ports:
      - "3000:3000"
```

**Usage:**

```bash
# Start the application
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild and start
docker-compose up --build
```

#### Environment Variables in Docker

**Option 1: Environment Variables in docker-compose.yml**

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CORS_ORIGIN=https://app.example.com
```

**Option 2: Using .env file**

Create a `.env` file and reference it in `docker-compose.yml`:

```yaml
services:
  app:
    env_file:
      - .env
```

**Option 3: Docker run command**

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://app.example.com \
  node-ts-express-template
```

#### Development with Docker

For development with hot reload, you can mount your source code:

```yaml
services:
  app:
    build:
      context: .
      target: builder  # Use builder stage for dev dependencies
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    environment:
      - NODE_ENV=development
    command: npm run dev
```

Or run development server directly:

```bash
# Run dev server with volume mounts
docker run -it -p 3000:3000 \
  -v "$(pwd)/src:/app/src" \
  -e NODE_ENV=development \
  node-ts-express-template npm run dev
```

#### Production Deployment with Docker

**Best Practices:**

1. **Use Multi-Stage Builds** (already configured)
2. **Run as Non-Root User** (optional, add to Dockerfile if needed)
3. **Health Checks** in docker-compose.yml:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

4. **Resource Limits**:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Docker Registry Deployment:**

```bash
# Tag for your registry
docker tag node-ts-express-template your-registry.com/node-ts-express-template:latest

# Push to registry
docker push your-registry.com/node-ts-express-template:latest

# Pull and run on production server
docker pull your-registry.com/node-ts-express-template:latest
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://app.example.com \
  --restart unless-stopped \
  your-registry.com/node-ts-express-template:latest
```

#### Dockerfile Features

The included Dockerfile provides:

- **Automatic Package Manager Detection**: Supports npm, pnpm, and yarn
- **Optimized Layer Caching**: Dependencies installed before source code copy
- **Security**: Uses `--ignore-scripts` to prevent malicious package scripts
- **Production Optimization**: Separate stages for build and runtime
- **Graceful Shutdown**: Direct node execution (not through npm) for proper signal handling
- **Health-Friendly**: Exposes port 3000 and works with `/health`, `/ready`, `/live` endpoints

### Kubernetes Deployment

Example deployment with health checks:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: your-registry/node-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: CORS_ORIGIN
          value: "https://app.example.com"
        livenessProbe:
          httpGet:
            path: /live
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 10"]
```

The `preStop` hook gives the load balancer time to remove the pod from rotation before SIGTERM is sent.

### Error Handling in Production

The error handler automatically adapts to the environment:

**Development:**
- Returns detailed error messages
- Includes stack traces
- Logs full error details

**Production:**
- Returns generic error messages for unexpected errors
- Hides stack traces from API responses
- Logs errors without exposing internal details

This is handled automatically in `src/middleware/error-handler.ts` based on `NODE_ENV`.

### Performance Considerations

**Built-in Optimizations:**
- Helmet security headers with caching
- CORS preflight caching (24 hours)
- Minimal middleware overhead
- Efficient error handling

**Recommended Additions:**
- Response compression (gzip/brotli)
- Database connection pooling
- Redis caching layer
- CDN for static assets

### Monitoring and Observability

**Health Check Endpoints:**
- `/health` - Basic health check
- `/ready` - Readiness for traffic (add database checks here)
- `/live` - Liveness probe (add critical dependency checks)

**Request Tracing:**
- Every request has a unique `X-Request-Id` header
- Correlate logs across services
- Track requests through distributed systems

**Recommended Monitoring:**
- Application Performance Monitoring (APM): New Relic, Datadog, AppDynamics
- Error Tracking: Sentry, Rollbar, Bugsnag
- Log Aggregation: CloudWatch, Datadog, ELK
- Metrics: Prometheus, StatsD, CloudWatch Metrics

### Sentry Error Tracking

This template includes built-in Sentry integration for error tracking, performance monitoring, and profiling. Sentry is **optional** and only activates when you provide a DSN.

**Enabling Sentry:**

Set the `SENTRY_DSN` environment variable to enable Sentry:

```bash
# Required - enables Sentry
SENTRY_DSN=https://your-key@sentry.io/project-id

# Optional configuration
SENTRY_ENVIRONMENT=production          # Defaults to NODE_ENV
SENTRY_RELEASE=1.0.0                   # Version tag for releases
SENTRY_TRACES_SAMPLE_RATE=1.0          # Performance monitoring (0.0-1.0)
SENTRY_PROFILES_SAMPLE_RATE=1.0        # Profiling (0.0-1.0)
```

**Features:**

- **Error Tracking** - Automatic capture of unhandled exceptions and rejections
- **Performance Monitoring** - Request tracing and transaction monitoring
- **Profiling** - CPU profiling for performance analysis
- **Express Integration** - Automatic request/response instrumentation
- **Sensitive Data Redaction** - Authorization headers and cookies are automatically redacted

**Using Sentry Utilities:**

The template provides utility functions in `src/lib/sentry.ts`:

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from "@/lib/sentry"

// Capture an error with context
try {
  await riskyOperation()
} catch (error) {
  captureException(error, { userId: "123", action: "riskyOperation" })
}

// Log a message to Sentry
captureMessage("User completed onboarding", "info", { plan: "premium" })

// Set user context for error tracking
setUser({ id: "123", email: "user@example.com" })

// Add breadcrumbs for debugging
addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info"
})
```

**Graceful Shutdown:**

Sentry events are automatically flushed during graceful shutdown. For manual control:

```typescript
import { flush, close } from "@/lib/sentry"

// Flush pending events (e.g., before Lambda timeout)
await flush(2000)

// Close Sentry client
await close(2000)
```

**Important:** The Sentry instrumentation module (`src/instrument.ts`) must be imported before all other modules in your entry point. This is already configured in the template.

### Other Commands

- `npm run clean` - Remove the `dist/` directory

### Code Quality

Format and lint your code with Biome:

```bash
npm run format        # Check formatting
npm run format:fix    # Fix formatting issues
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues
npm run check         # Run both linting and formatting checks
npm run check:fix     # Fix both linting and formatting issues
```

### Pre-commit Hooks

This template uses Husky and lint-staged to ensure code quality before commits:

- **Automatic Linting** - Biome automatically checks and fixes issues on staged files
- **Format Enforcement** - Code is formatted consistently before each commit
- **Zero Configuration** - Hooks are set up automatically on `npm install`

The pre-commit hook runs `biome check --write` on all staged files, ensuring that only properly formatted and linted code is committed.

### Commit Message Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) using commitlint. All commit messages must follow this format:

```
<type>(<scope>): <subject>
```

**Allowed Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring (no feature or bug fix)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, configs, etc.)

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix(api): resolve rate limiting issue"
git commit -m "docs: update README with new endpoints"
```

Invalid commit messages will be rejected by the commit-msg hook.

### Testing

Run the test suite:

```bash
npm test
```

#### Test Scripts

- **`npm test`** - Run all tests once
- **`npm run test:watch`** - Run tests in watch mode (reruns on file changes)
- **`npm run test:coverage`** - Run tests with coverage report
- **`npm run test:ci`** - Run tests in CI mode (no watch, with coverage)

#### Running Specific Tests

Run a single test file:

```bash
npm test -- tests/unit/env.test.ts --watch
```

Run a specific test case by name:

```bash
npm test -- --testNamePattern="should define correct schema structure" --watch
```

#### Test Structure

The project includes comprehensive testing with Jest and Supertest:

- **Unit Tests** (`tests/unit/`) - Test individual functions and modules

  - Environment variable validation
  - Zod schema testing
  - Utility function testing

- **Integration Tests** (`tests/integration/`) - Test complete workflows

  - Express HTTP endpoints
  - Request/response handling
  - Middleware functionality
  - Server performance testing

- **Test Utilities** (`tests/setup/`) - Helper functions and configurations
  - Mock environment setup
  - Test server utilities
  - Common test patterns

#### Test Coverage

The project maintains high test coverage. Run coverage reports with:

```bash
npm run test:coverage
```

**Coverage Summary:**

| Category | Target | Description |
|----------|--------|-------------|
| Statements | 85%+ | Lines of code executed |
| Branches | 70%+ | Decision paths covered |
| Functions | 80%+ | Functions called |
| Lines | 85%+ | Source lines covered |

**Coverage Reports:**
- **Terminal**: Summary displayed after running `npm run test:coverage`
- **HTML Report**: Generated in `coverage/lcov-report/index.html` for detailed file-by-file analysis
- **CI Integration**: Coverage uploaded to Codecov on each push (see CI/CD section)

**Key Test Files:**

| Test File | Coverage Area |
|-----------|---------------|
| `tests/unit/errors.test.ts` | Custom error classes |
| `tests/unit/jwt.test.ts` | JWT token utilities |
| `tests/unit/sentry.test.ts` | Sentry integration |
| `tests/unit/user-service-stub.test.ts` | User service implementation |
| `tests/integration/auth.test.ts` | Authentication flow |
| `tests/integration/health.test.ts` | Health check endpoints |

#### Writing Tests

Create test files with `.test.ts` or `.spec.ts` extensions in the `tests/` directory:

```typescript
// tests/unit/example.test.ts
describe("Example Test", () => {
  it("should pass", () => {
    expect(true).toBe(true)
  })
})
```

Tests automatically have access to:

- Jest testing framework
- Supertest for HTTP testing
- TypeScript support
- Environment mocking utilities

#### Testing Express Routes

Use Supertest to test your Express routes:

```typescript
import request from "supertest"
import { app } from "@/index"

describe("API Tests", () => {
  it("should return users list", async () => {
    const response = await request(app)
      .get("/api/users")
      .expect(200)

    expect(response.body).toHaveProperty("users")
  })

  it("should create a new user", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" }

    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .set("Content-Type", "application/json")
      .expect(201)

    expect(response.body).toHaveProperty("message", "User created")
  })

  it("should return 404 for undefined routes", async () => {
    const response = await request(app)
      .get("/nonexistent")
      .expect(404)

    expect(response.body).toEqual({ error: "Not Found" })
  })
})
```

### Manual API Testing

This project includes configuration for manual API testing using VS Code REST Client and Postman.

#### VS Code REST Client

REST Client requests are available in [tests/rest/requests.http](tests/rest/requests.http).

**Quick Start:**
1. Install the `humao.rest-client` extension (recommended via `.vscode/extensions.json`)
2. Start the server: `npm run dev`
3. Open [tests/rest/requests.http](tests/rest/requests.http)
4. Click "Send Request" above any request

**Features:**
- Simple text-based request format
- Variable support with `@baseUrl`
- Multiple requests in a single file
- Inline response viewing

#### Postman Collection

A comprehensive Postman collection is available at [tests/rest/postman_collection.json](tests/rest/postman_collection.json).

**Quick Start:**
1. Open Postman
2. Click "Import" → Select `tests/rest/postman_collection.json`
3. Start the server: `npm run dev`
4. Run requests from the collection

**Features:**
- Organized request folders (Health, Auth, API v1, etc.)
- Collection variables for `baseUrl`, `accessToken`, `refreshToken`
- Auto-save tokens on login for authenticated requests
- Request descriptions and expected responses
- JWT authentication flow with test scripts

#### Understanding Expected Responses

The template uses **Express routing**, which means routes must be explicitly defined. The following routes are pre-configured:

**Will Return 200 OK:**
- `GET /` - Returns the greeting message
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint
- `GET /live` - Liveness check endpoint
- `GET /api/v1/` - Returns the greeting message
- `GET /api/v1/example` - Returns example JSON response
- `GET /api/v1/async-example` - Returns async example response
- `GET /api/v1/async-error-example` - Demonstrates error handling (will return 500)

**Will Return 404 Not Found:**
- Any POST, PUT, DELETE, PATCH requests (unless you define them)
- Any GET requests to undefined routes
- Response format: `{"error": "Not Found"}`

This is **expected Express behavior**. Express only responds to routes you explicitly define.

**To add new routes:**
1. Create route modules in `src/routes/v1/` following the examples
2. Register them in `src/routes/v1/index.ts`
3. Update the requests.http file with your new endpoints
4. Test your new routes using the REST Client

See the comments in [tests/rest/requests.http](tests/rest/requests.http) for detailed usage instructions and example route templates you can uncomment after implementing them.

#### Available Test Requests

The requests file includes:
- **Health Check Endpoints** - Test /health, /ready, and /live endpoints
- **Basic GET Requests** - Test the root route and observe 404 for undefined routes
- **POST Requests** - Examples that return 404 (add your own routes to make them work)
- **Other HTTP Methods** - PUT, DELETE, PATCH examples (currently return 404)
- **Security Headers** - Verify Helmet security headers
- **CORS** - Test cross-origin requests
- **Example Templates** - Commented examples for common API endpoints you might add

## Recommended VS Code Extensions

This project includes recommended VS Code extensions in [.vscode/extensions.json](.vscode/extensions.json). When you open the project in VS Code, you'll be prompted to install them.

### Recommended Extensions

- **Better TypeScript Errors** (`better-ts-errors.better-ts-errors`) - Makes TypeScript error messages more readable and easier to understand
- **Biome** (`biomejs.biome`) - Official Biome extension for linting and formatting with real-time feedback
- **Jest** (`Orta.vscode-jest`) - Integrated Jest testing with inline test results and debugging
- **Path Intellisense** (`christian-kohler.path-intellisense`) - Autocomplete for file paths in your code

## Configuration

### TypeScript Configuration

The `tsconfig.json` is configured with:

- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Source maps for debugging
- Declaration files generation

#### Path Aliases

This template uses TypeScript path aliases to simplify imports and avoid relative path hell:

**Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Usage:**

```typescript
// ❌ Before: Relative imports
import { logger } from "../../../lib/logger"
import { GREETING } from "../../../lib/constants"
import { app } from "../../index"

// ✅ After: Clean path aliases
import { logger } from "@/lib/logger"
import { GREETING } from "@/lib/constants"
import { app } from "@/index"
```

**Benefits:**
- **Cleaner code** - No more `../../..` chains
- **Easier refactoring** - Moving files doesn't break imports
- **Better readability** - Clear what's from your source vs node_modules
- **IDE support** - Full autocomplete and go-to-definition

**Build Support:**

The template uses `tsc-alias` to resolve path aliases during the build process:

```bash
npm run build  # Compiles and resolves @/* aliases
```

Both `ts-node` (development) and `tsc-alias` (production) handle the path resolution automatically.

### Environment Variables

This project uses **Zod** for type-safe environment variable validation and parsing.

#### Configuration

Environment variables are defined and validated in `src/lib/env.ts` using Zod schemas:

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.number().default(3000).optional(),
})
```

#### Supported Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development, production, test, staging)
- `CORS_ORIGIN` - Comma-separated list of allowed CORS origins (optional)
  - Example: `CORS_ORIGIN=https://app.example.com,https://admin.example.com`
  - If not set, allows all origins in development (`true`)
  - In production, you should explicitly set allowed origins for security
- `LOG_LEVEL` - Logging level: trace, debug, info, warn, error, fatal (default: info in production, debug in development)
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window (default: 100)
- `SHUTDOWN_TIMEOUT_MS` - Graceful shutdown timeout in milliseconds (default: 30000)
- `ENABLE_JWT_AUTH` - Enable JWT authentication (default: false)
- `JWT_SECRET` - Secret key for signing JWT tokens (min 32 characters, required when auth enabled)
- `JWT_EXPIRY` - Access token expiry duration (default: 1h)
- `JWT_REFRESH_EXPIRY` - Refresh token expiry duration (default: 7d)

#### Adding New Environment Variables

1. Update the Zod schema in `src/lib/env.ts`:

   ```typescript
   const EnvSchema = z.object({
     NODE_ENV: z.string().optional(),
     PORT: z.number().default(3000).optional(),
     // Add your new variable here
     DATABASE_URL: z.string().url(),
     API_KEY: z.string().min(1),
   })
   ```

2. Create a `.env` file in the root directory for development:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   DATABASE_URL=postgresql://localhost:5432/mydb
   API_KEY=your-secret-key
   ```

#### Benefits

- **Runtime Validation** - Environment variables are validated at startup
- **Type Safety** - Full TypeScript support for environment variables
- **Clear Error Messages** - Helpful error messages for missing or invalid variables
- **Default Values** - Support for default values when variables are optional

## CI/CD

This template includes GitHub Actions workflows for continuous integration and deployment:

### Test Workflow

Runs on every push and pull request to `main` and `develop` branches:

- **Node.js 24** - Tests on the latest required version
- **Test Coverage** - Runs full test suite with coverage reporting
- **Coverage Upload** - Automatically uploads coverage reports to Codecov

### Build Workflow

Runs on every push and pull request to `main` and `develop` branches:

- **Matrix Building** - Builds on Node.js versions 22 and 24
- **Build Validation** - Ensures the project builds successfully and verifies artifacts
- **Artifact Storage** - Saves build artifacts for 7 days

### Code Quality Workflow

Ensures code quality standards:

- **Biome Linting** - Checks code style and potential issues
- **Formatting** - Validates code formatting
- **Auto-fix** - Automatically fixes formatting issues when possible

### Setting Up Codecov (Optional)

To enable coverage reporting:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Add `CODECOV_TOKEN` to your GitHub repository secrets
4. Coverage reports will be automatically uploaded on each CI run

If you don't want to use Codecov, remove it from the test workflow in `.github/workflows/test.yml`.

## Scripts Explained

- **`npm run dev`** - Uses `nodemon` and `ts-node` to run TypeScript directly with hot reload
- **`npm run build`** - Compiles TypeScript using the TypeScript compiler (`tsc`)
- **`npm start`** - Runs the compiled JavaScript from the `dist/` directory
- **`npm run clean`** - Removes build artifacts
- **`npm run prepare`** - Automatically sets up Husky git hooks (runs on `npm install`)

## Dependencies

### Runtime Dependencies

- **express** - Fast, unopinionated, minimalist web framework for Node.js
- **helmet** - Security middleware for setting HTTP headers
- **cors** - Cross-Origin Resource Sharing middleware
- **dotenv** - Load environment variables from `.env` files
- **zod** - TypeScript-first schema validation for environment variables
- **pino** - High-performance JSON logger for Node.js
- **pino-pretty** - Pretty-print Pino logs in development
- **express-rate-limit** - Basic IP rate-limiting middleware for Express
- **jsonwebtoken** - JWT token generation and verification for authentication
- **bcrypt** - Password hashing library for secure credential storage
- **swagger-ui-express** - Serve auto-generated Swagger UI for API documentation
- **swagger-jsdoc** - Generate OpenAPI specification from JSDoc comments

### Development Dependencies

- **typescript** - TypeScript compiler
- **@types/node** - Node.js type definitions
- **@types/express** - TypeScript definitions for Express
- **ts-node** - Run TypeScript directly without compilation
- **nodemon** - Monitor for file changes and auto-restart
- **rimraf** - Cross-platform rm -rf command
- **@biomejs/biome** - Fast linter and formatter for JavaScript/TypeScript
- **husky** - Git hooks made easy
- **lint-staged** - Run linters on git staged files

### Testing Dependencies

- **jest** - JavaScript testing framework
- **@types/jest** - TypeScript definitions for Jest
- **ts-jest** - Jest transformer for TypeScript
- **supertest** - HTTP testing library
- **@types/supertest** - TypeScript definitions for Supertest

## Troubleshooting

### Jest Error When First Opening the Project

When you first open this project in your editor, you may see a Jest-related error before running `npm install`. This is expected behavior and occurs because Jest and its dependencies haven't been installed yet.

**Solution:** Simply run `npm install` to install all project dependencies. The error will disappear once the packages are installed.

## License

MIT
