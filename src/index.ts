import cors from "cors"
import dotenv from "dotenv"
import express, { type Request, type Response } from "express"
import helmet from "helmet"
import { GREETING } from "@/lib/constants"
import env from "@/lib/env"
import { logger } from "@/lib/logger"
import { errorHandler, requestLogger } from "@/middleware"

dotenv.config({ quiet: true })

const app = express()
const PORT: number = env.PORT ?? 3000

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

// Request logging
app.use(requestLogger)

// Routes
app.get("/", (_req: Request, res: Response) => {
	res.send(GREETING)
})

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Not Found" })
})

// Centralized error handler (must be last)
app.use(errorHandler)

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
const sigTermHandler = () => {
	logger.info("🔄 SIGTERM received, shutting down gracefully...")
	server.close(() => {
		logger.info("✅ Process terminated")
		process.exit(0)
	})
}

process.on("SIGTERM", sigTermHandler)

// Export cleanup function for testing
export const cleanup = () => {
	process.removeListener("SIGTERM", sigTermHandler)
}

export { app }
export default server
