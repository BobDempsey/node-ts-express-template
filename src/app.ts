import * as Sentry from "@sentry/node"
import cors from "cors"
import dotenv from "dotenv"
import express, { type Request, type Response } from "express"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "@/docs/swagger"
import { GREETING } from "@/lib/constants"
import env from "@/lib/env"
import {
	errorHandler,
	rateLimiter,
	requestLogger,
	requireAuth
} from "@/middleware"
import routes from "@/routes"

dotenv.config({ quiet: true })

const app = express()

// Middleware
app.use(helmet())

// CORS Configuration
const corsOptions = {
	origin: env.CORS_ORIGIN ?? true, // Allow all origins in development, or use configured origins
	credentials: true, // Allow cookies and credentials
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "sentry-trace", "baggage"],
	exposedHeaders: ["Content-Length", "X-Request-Id"],
	maxAge: 86400 // 24 hours
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging (must be before rate limiter for request ID context)
app.use(requestLogger)

// Rate limiting (skips /health, /ready, /live, /docs)
app.use(rateLimiter)

// JWT Authentication (optional - enable with ENABLE_JWT_AUTH=true)
if (env.ENABLE_JWT_AUTH) {
	app.use(
		requireAuth({
			exclude: [
				"/health",
				"/ready",
				"/live",
				"/docs",
				"/api/v1/auth/login",
				"/api/v1/auth/refresh"
			]
		})
	)
}

// Public root route (before auth-protected routes)
app.get("/", (_req: Request, res: Response) => {
	res.send(GREETING)
})

// API Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use(routes)

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Not Found" })
})

// Sentry error handler - must be before custom error handler
if (process.env.SENTRY_DSN) {
	Sentry.setupExpressErrorHandler(app)
}

// Centralized error handler (must be last)
app.use(errorHandler)

export { app }
