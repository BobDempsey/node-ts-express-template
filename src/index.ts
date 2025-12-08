import { app } from "@/app"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

const PORT: number = env.PORT ?? 3000

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
