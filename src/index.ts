import dotenv from "dotenv"
import { createServer } from "http"
import { GREETING } from "@/lib/constants"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

dotenv.config()
const PORT: number = env.PORT ?? 3000

const server = createServer((_req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" })
	res.end(GREETING)
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

server.listen(PORT, () => {
	logger.info(`🚀 Server is running on http://localhost:${PORT}`)
	logger.info(`📁 Environment: ${env.NODE_ENV || "development"}`)
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

export default server
