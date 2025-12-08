# Node.js TypeScript Express Template

[![Test](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml)
[![Build](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml)
[![Biome Lint and Format](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml)
[![codecov](https://codecov.io/gh/BobDempsey/node-ts-template/branch/main/graph/badge.svg)](https://codecov.io/gh/BobDempsey/node-ts-template)

A production-ready Node.js project template with TypeScript and Express.js support.

## Features

- ⚡ **Express.js** - Fast, unopinionated web framework with TypeScript support
- 🚀 **TypeScript** - Full TypeScript support with strict type checking
- 🔄 **Hot Reload** - Automatic restart on file changes during development
- 📦 **Modern Node.js** - Targets ES2020 and Node.js 24+
- 🛠️ **Development Ready** - Pre-configured build and development scripts
- 🔒 **Type-Safe Environment** - Zod-based environment variable validation and type safety
- 🧪 **Testing Suite** - Jest and Supertest for comprehensive unit and integration testing
- 🎨 **Code Quality** - Biome for fast linting and formatting
- 🪝 **Pre-commit Hooks** - Husky and lint-staged for automatic code quality checks
- 📝 **Built-in Logger** - Custom logger with timestamps and log levels
- 🛡️ **Security Headers** - Helmet middleware pre-configured for HTTP security
- 🛡️ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Request Validation** - Built-in Zod-based validation middleware for request body, params, and query
- 🏥 **Health Check Endpoints** - Built-in /health, /ready, and /live endpoints for monitoring
- 🔢 **API Versioning** - Organized route structure with v1 API endpoints and example routes
- ⚡ **Async Handler** - Built-in utility for automatic async error handling

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

**Next Steps:**
- Add your routes in `src/routes/v1/` for versioned API endpoints
- Configure environment variables in `.env`
- Run tests with `npm test`
- Build for production with `npm run build`

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
│   │   ├── logger.ts       # Custom logger with timestamps and log levels
│   │   └── constants.ts    # Application constants
│   ├── middleware/
│   │   ├── index.ts        # Middleware exports
│   │   ├── error-handler.ts # Centralized error handling
│   │   ├── request-logger.ts # Request logging with tracing
│   │   └── validate.ts      # Request validation with Zod
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
│   │       └── example.routes.ts # Example v1 endpoints
│   ├── utils/
│   │   ├── index.ts        # Utility exports
│   │   └── async-handler.ts # Async route error wrapper
│   └── index.ts            # Main entry point (Express server)
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── rest/               # VS Code REST Client requests
│   │   └── requests.http   # HTTP request examples
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
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 24.0.0 or higher
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

The Express application is set up in `src/index.ts` with the following features:

```typescript
import express, { type Request, type Response } from "express"
import helmet from "helmet"

const app = express()

// Middleware
app.use(helmet())                          // Security headers
app.use(express.json())                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }))  // Parse URL-encoded bodies

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!")
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})
```

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

#### Structured Responses

Create consistent API response formats:

```typescript
// src/lib/response.ts
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data
})

export const errorResponse = (message: string, errors?: unknown) => ({
  success: false,
  message,
  errors
})

// Usage in routes
import { successResponse, errorResponse } from "@/lib/response"

app.get("/api/users", async (req, res) => {
  const users = await getUsers()
  res.json(successResponse(users, "Users retrieved successfully"))
})

app.post("/api/users", async (req, res) => {
  try {
    const user = await createUser(req.body)
    res.status(201).json(successResponse(user, "User created"))
  } catch (error) {
    res.status(400).json(errorResponse("Failed to create user", error))
  }
})
```

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

Log all incoming requests for debugging and monitoring:

```typescript
import { logger } from "@/lib/logger"

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start
    logger.info(
      `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    )
  })

  next()
})
```

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

Enable Cross-Origin Resource Sharing for API access:

```bash
npm install cors
npm install --save-dev @types/cors
```

```typescript
import cors from "cors"

// Allow all origins (development only)
app.use(cors())

// Production configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)
```

#### Rate Limiting

Protect your API from abuse with rate limiting:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from "express-rate-limit"

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// Stricter limit for specific routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: "Too many login attempts, please try again later."
})

app.post("/api/auth/login", authLimiter, (req, res) => {
  // Login logic
})
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

This project includes configuration for manual API testing using the VS Code REST Client extension.

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

### Installing Extensions

VS Code will automatically prompt you to install recommended extensions when you open the project. Alternatively, you can:

1. Open the Extensions view (Cmd+Shift+X on macOS, Ctrl+Shift+X on Windows/Linux)
2. Type `@recommended` in the search box
3. Install the extensions listed under "Workspace Recommendations"

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
- `NODE_ENV` - Environment mode (development, production, test)

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

If you don't want to use Codecov, the workflow will continue without failing.

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
- **dotenv** - Load environment variables from `.env` files
- **zod** - TypeScript-first schema validation for environment variables

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
