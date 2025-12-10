import cors from "cors"
import dotenv from "dotenv"
import express, { type Request, type Response } from "express"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "@/docs/swagger"
import { GREETING } from "@/lib/constants"
import env from "@/lib/env"
import { errorHandler, rateLimiter, requestLogger } from "@/middleware"
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
	allowedHeaders: ["Content-Type", "Authorization"],
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

// API Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use(routes)

app.get("/", (_req: Request, res: Response) => {
	res.send(GREETING)
})

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Not Found" })
})

// Centralized error handler (must be last)
app.use(errorHandler)

export { app }
