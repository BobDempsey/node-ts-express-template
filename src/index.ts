// CRITICAL: Import tracer FIRST before any other imports for dd-trace instrumentation
import "./lib/tracer"

import { app } from "@/app"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

const PORT: number = env.PORT ?? 3000
const SHUTDOWN_TIMEOUT: number = env.SHUTDOWN_TIMEOUT_MS ?? 30000

// Track shutdown state to prevent multiple shutdown attempts
let isShuttingDown = false

// Start server
const server = app.listen(PORT, () => {
	logger.info(`🚀 Server is running on http://localhost:${PORT}`)
	logger.info(`📁 Environment: ${env.NODE_ENV || "development"}`)
})

// Handle server errors
server.on("error", (err: NodeJS.ErrnoException) => {
	if (err.code === "EADDRINUSE") {
		logger.error({ port: PORT, err }, `Port ${PORT} is already in use`)
		process.exit(1)
	}
	logger.error({ err }, `Server error: ${err.message}`)
	process.exit(1)
})

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
	// Prevent multiple shutdown attempts
	if (isShuttingDown) {
		logger.warn(`${signal} received again, shutdown already in progress`)
		return
	}
	isShuttingDown = true

	logger.info(`🔄 ${signal} received, shutting down gracefully...`)

	// Set a forced shutdown timeout
	const forceShutdownTimer = setTimeout(() => {
		logger.error(
			`⚠️ Graceful shutdown timed out after ${SHUTDOWN_TIMEOUT}ms, forcing exit`
		)
		process.exit(1)
	}, SHUTDOWN_TIMEOUT)

	// Don't keep the process alive just for this timer
	forceShutdownTimer.unref()

	// Close the server (stop accepting new connections)
	server.close((err) => {
		clearTimeout(forceShutdownTimer)

		if (err) {
			logger.error({ err }, "Error during server close")
			process.exit(1)
		}

		logger.info("✅ Server closed, all connections finished")
		process.exit(0)
	})
}

// Handle termination signals
const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGHUP"]
for (const signal of signals) {
	process.on(signal, () => gracefulShutdown(signal))
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	logger.fatal({ err }, "Uncaught exception, shutting down")
	gracefulShutdown("uncaughtException")
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
	logger.fatal(
		{ reason, promise },
		"Unhandled promise rejection, shutting down"
	)
	gracefulShutdown("unhandledRejection")
})

// Export cleanup function for testing
export const cleanup = () => {
	for (const signal of signals) {
		process.removeAllListeners(signal)
	}
	process.removeAllListeners("uncaughtException")
	process.removeAllListeners("unhandledRejection")
	isShuttingDown = false
}

// Export for testing
export const getShutdownState = () => isShuttingDown
export const resetShutdownState = () => {
	isShuttingDown = false
}

export { app }
export default server
