// IMPORTANT: Sentry instrumentation must be imported FIRST
import "./instrument"
import * as Sentry from "@sentry/node"

import { app } from "@/app"
import env from "@/lib/env"
import { logger } from "@/lib/logger"
import { flush as flushSentry } from "@/lib/sentry"

const PORT: number = env.PORT ?? 3000
const SHUTDOWN_TIMEOUT: number = env.SHUTDOWN_TIMEOUT_MS ?? 30000

// Track shutdown state to prevent multiple shutdown attempts
let isShuttingDown = false

// Start server
const server = app.listen(PORT, () => {
	logger.info(`Server is running on http://localhost:${PORT}`)
	logger.info(`Environment: ${env.NODE_ENV || "development"}`)
})

// Handle server errors
server.on("error", (err: NodeJS.ErrnoException) => {
	if (err.code === "EADDRINUSE") {
		logger.error({ port: PORT, err }, `Port ${PORT} is already in use`)
		Sentry.captureException(err, { tags: { errorType: "ServerStartup" } })
		process.exit(1)
	}
	logger.error({ err }, `Server error: ${err.message}`)
	Sentry.captureException(err, { tags: { errorType: "ServerError" } })
	process.exit(1)
})

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
	// Prevent multiple shutdown attempts
	if (isShuttingDown) {
		logger.warn(`${signal} received again, shutdown already in progress`)
		return
	}
	isShuttingDown = true

	logger.info(`${signal} received, shutting down gracefully...`)

	// Set a forced shutdown timeout
	const forceShutdownTimer = setTimeout(async () => {
		logger.error(
			`Graceful shutdown timed out after ${SHUTDOWN_TIMEOUT}ms, forcing exit`
		)
		await flushSentry(2000)
		process.exit(1)
	}, SHUTDOWN_TIMEOUT)

	// Don't keep the process alive just for this timer
	forceShutdownTimer.unref()

	// Close the server (stop accepting new connections)
	server.close(async (err) => {
		clearTimeout(forceShutdownTimer)

		if (err) {
			logger.error({ err }, "Error during server close")
			await flushSentry(2000)
			process.exit(1)
		}

		logger.info("Server closed, all connections finished")

		// Flush Sentry events before exit
		await flushSentry(2000)
		process.exit(0)
	})
}

// Handle termination signals
const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGHUP"]
for (const signal of signals) {
	process.on(signal, () => gracefulShutdown(signal))
}

// Handle uncaught exceptions - capture with Sentry before shutdown
process.on("uncaughtException", async (err) => {
	logger.fatal({ err }, "Uncaught exception, shutting down")

	// Capture to Sentry with high priority
	Sentry.captureException(err, {
		level: "fatal",
		tags: { errorType: "UncaughtException" }
	})

	// Flush before shutdown
	await flushSentry(2000)
	gracefulShutdown("uncaughtException")
})

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
	logger.fatal(
		{ reason, promise },
		"Unhandled promise rejection, shutting down"
	)

	// Capture to Sentry
	const error = reason instanceof Error ? reason : new Error(String(reason))
	Sentry.captureException(error, {
		level: "fatal",
		tags: { errorType: "UnhandledRejection" },
		extra: { promise: String(promise) }
	})

	// Flush before shutdown
	await flushSentry(2000)
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
