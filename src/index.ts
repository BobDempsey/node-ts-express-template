// IMPORTANT: Sentry instrumentation must be imported FIRST
import "./instrument"
import * as Sentry from "@sentry/node"

import { app } from "@/app"
import env from "@/lib/env"
import { getShutdownState, resetShutdownState } from "@/lib/graceful-shutdown"
import { logger } from "@/lib/logger"
import {
	cleanupSignalHandlers,
	setupSignalHandlers
} from "@/lib/signal-handler"

const PORT: number = env.PORT ?? 3000
const SHUTDOWN_TIMEOUT: number = env.SHUTDOWN_TIMEOUT_MS ?? 30000

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

// Setup signal and error handlers
setupSignalHandlers({
	server,
	shutdownTimeoutMs: SHUTDOWN_TIMEOUT
})

// Export cleanup function for testing
export const cleanup = () => {
	cleanupSignalHandlers()
	resetShutdownState()
}

// Export for testing
export { getShutdownState, resetShutdownState }
export { app }
export default server
