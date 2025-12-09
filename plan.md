# Node Express TypeScript Template - Improvement Plan

## Current State Assessment

### Strengths

- **Strict TypeScript** with path aliases and proper configs
- **Type-safe environment variables** via Zod schema validation
- **Comprehensive testing** (63 tests, unit + integration)
- **Modern tooling** (Biome, Husky, lint-staged)
- **CI/CD pipelines** for tests, builds, and linting
- **Graceful shutdown** handling
- **Minimal dependencies** - lean and intentional

### Current Limitations

- Single route defined (GET /)
- No middleware patterns beyond body parsing
- No request logging
- No custom error classes or centralized error handling
- No request validation middleware
- No CORS configuration
- No health check endpoints
- No API documentation

---

## Recommended Improvements

### 1. Middleware Architecture

Create a middleware layer for cross-cutting concerns:

```
src/
├── middleware/
│   ├── index.ts            # Export all middleware
│   ├── request-logger.ts   # Log incoming requests with duration
│   ├── error-handler.ts    # Centralized error handling
│   ├── not-found.ts        # 404 handler (extract from index.ts)
│   └── validate.ts         # Zod-based request validation
```

**Request Logger Middleware**
- Log method, path, status code, and response time
- Include request ID for tracing
- Use structured JSON format in production

**Error Handler Middleware**
- Catch all errors in one place
- Return consistent error response shape
- Log errors with stack traces in development only

**Validation Middleware**
- Generic middleware factory using Zod schemas
- Validate body, params, and query separately
- Return detailed validation errors

### 2. Route Organization

Restructure routes for scalability:

```
src/
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── health.routes.ts    # Health check endpoints
│   └── v1/                 # API versioning
│       ├── index.ts
│       └── example.routes.ts
```

**Health Check Endpoints**
- `GET /health` - Basic health check (always returns 200)
- `GET /ready` - Readiness check (verify dependencies)
- `GET /live` - Liveness check (for Kubernetes probes)

**API Versioning Pattern**
- Group routes under `/api/v1/`
- Easy to add v2 without breaking existing clients

### 3. Error Handling

Create typed error classes:

```
src/
├── errors/
│   ├── index.ts
│   ├── app-error.ts        # Base error class
│   ├── validation-error.ts # Request validation failures
│   ├── not-found-error.ts  # Resource not found
│   └── unauthorized-error.ts
```

**Consistent Error Response Shape**
```json
{
  "error": "Human readable message",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": {}
}
```

**Async Error Wrapper**
- Wrap async route handlers to catch promise rejections
- Or use `express-async-errors` package for automatic handling

### 4. Security Hardening

**Add Security Packages**

| Package | Purpose |
|---------|---------|
| `helmet` | Secure HTTP headers (XSS, clickjacking, etc.) |
| `cors` | Cross-Origin Resource Sharing configuration |
| `express-rate-limit` | API rate limiting |

**Configuration Updates**
- Set explicit request body size limits
- Configure CORS allowlist for production
- Add rate limiting per IP/endpoint

### 5. Observability & Logging

**Upgrade Logging**

Consider replacing custom logger with structured logging:

| Option | Pros |
|--------|------|
| `pino` | Fast, JSON output, low overhead |
| `winston` | Flexible transports, widely used |

**Features to Add**
- Request ID generation and propagation
- Log request/response metadata
- Separate log levels per environment
- Optional file/external transport

### 6. API Documentation

**OpenAPI/Swagger Integration**

```
src/
├── docs/
│   ├── swagger.ts          # Swagger configuration
│   └── schemas/            # Reusable OpenAPI schemas
```

**Options**
- `swagger-jsdoc` + `swagger-ui-express` - JSDoc comments to OpenAPI
- `zod-to-openapi` - Generate from existing Zod schemas (recommended)

**Benefits**
- Auto-generated API documentation
- Interactive testing UI at `/docs`
- Client SDK generation capability

### 7. Docker Support

Add containerization:

```
/
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # Local development with services
├── docker-compose.prod.yml # Production configuration
└── .dockerignore           # Exclude unnecessary files
```

**Dockerfile Features**
- Multi-stage build (builder + runtime)
- Non-root user for security
- Health check instruction
- Optimized layer caching

### 8. Project Structure (Final)

```
src/
├── index.ts                # App entry point (minimal)
├── app.ts                  # Express app configuration
├── server.ts               # Server startup logic
├── config/
│   └── index.ts            # Centralized configuration
├── middleware/
│   ├── index.ts
│   ├── request-logger.ts
│   ├── error-handler.ts
│   ├── validate.ts
│   └── not-found.ts
├── routes/
│   ├── index.ts
│   ├── health.routes.ts
│   └── v1/
│       └── index.ts
├── errors/
│   ├── index.ts
│   ├── app-error.ts
│   └── http-errors.ts
├── lib/
│   ├── env.ts
│   ├── constants.ts
│   ├── logger.ts
│   └── try-parse-env.ts
├── types/
│   └── index.ts            # Shared TypeScript types
└── utils/
    └── async-handler.ts    # Async route wrapper
```

---

## Implementation Priority

### Phase 1: Foundation (High Priority)

1. [x] Add `helmet` for security headers
2. [x] Add `cors` with configuration
3. [x] Create custom error classes
4. [x] Add centralized error handler middleware
5. [x] Add request logging middleware
6. [x] Add health check endpoints

### Phase 2: Structure (Medium Priority)

7. [x] Reorganize routes into separate modules
8. [x] Add request validation middleware with Zod
9. [x] Add async error wrapper utility
10. [x] Separate app.ts from server startup

### Phase 3: DevOps (Medium Priority)

11. [x] Add Dockerfile (multi-stage)
12. [x] Add docker-compose.yml
13. [x] Add .dockerignore

### Phase 4: Documentation (Lower Priority)

14. [x] Add OpenAPI/Swagger documentation
15. [x] Add API endpoint examples
16. [x] Update README with new features

### Phase 5: Advanced (Optional)

17. [x] Upgrade to structured logging (pino)
18. [x] Add request ID middleware (included in request-logger with pino upgrade)
19. [x] Add rate limiting
20. [ ] Add graceful shutdown improvements

---

## New Dependencies

### Production

```json
{
  "helmet": "^8.0.0",
  "cors": "^2.8.5",
  "express-async-errors": "^3.1.1"
}
```

### Development

```json
{
  "@types/cors": "^2.8.17"
}
```

### Optional (Phase 4+)

```json
{
  "pino": "^9.0.0",
  "pino-pretty": "^11.0.0",
  "express-rate-limit": "^7.0.0",
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.0.0"
}
```

---

## Notes

- Each phase can be implemented independently
- All changes should include corresponding tests
- Maintain backwards compatibility where possible
- Keep the template minimal - don't over-engineer

## Misc/General

- before completing a feature, ensure all tests pass and coverage is maintained, ensure build succeeds
- include all appropriate tests (including regression tests) if needed
- update requests.http with examples if needed
- update readme if needed

## questions

- do we need the npm http status codes package for http errors and responses?
- do we want to include any database integration (e.g., a simple SQLite setup) as part of the template?
- do we want to include a standard logging library (e.g., pino or winston) instead of a custom logger?
- do we want to include a standard response format for all API responses?