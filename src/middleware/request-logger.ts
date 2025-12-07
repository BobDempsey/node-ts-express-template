import { randomUUID } from "node:crypto"
import type { NextFunction, Request, Response } from "express"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

/**
 * Request logging middleware
 * Logs HTTP method, path, status code, and response time
 * Includes request ID for tracing
 * Uses structured JSON format in production, human-readable in development
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Generate unique request ID
	const requestId = randomUUID()

	// Add request ID to request object for potential use in other middleware
	;(req as Request & { id: string }).id = requestId

	// Add request ID to response headers
	res.setHeader("X-Request-Id", requestId)

	// Record start time
	const startTime = Date.now()

	// Log when response finishes
	res.on("finish", () => {
		const duration = Date.now() - startTime
		const { method, originalUrl } = req
		const { statusCode } = res

		if (env.NODE_ENV === "production") {
			// Structured JSON format for production
			const logData = JSON.stringify({
				requestId,
				method,
				path: originalUrl,
				statusCode,
				duration,
				timestamp: new Date().toISOString()
			})
			console.log(logData)
		} else {
			// Human-readable format for development
			const statusEmoji =
				statusCode >= 500 ? "❌" : statusCode >= 400 ? "⚠️" : "✅"
			logger.info(
				`${statusEmoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms [${requestId}]`
			)
		}
	})

	next()
}
