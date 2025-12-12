import { randomUUID } from "node:crypto"
import type { NextFunction, Request, Response } from "express"
import { createChildLogger, getTraceContext } from "@/lib/logger"

/**
 * Request logging middleware using Pino structured logging
 * Logs HTTP method, path, status code, and response time
 * Includes request ID and Datadog trace ID for tracing
 * Uses JSON format for all environments
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Generate unique request ID
	const requestId = randomUUID()

	// Get Datadog trace context if available
	const { trace_id: traceId, span_id: spanId } = getTraceContext()

	// Add request ID to request object for potential use in other middleware
	;(req as Request & { id: string }).id = requestId

	// Add request ID to response headers
	res.setHeader("X-Request-Id", requestId)

	// Add Datadog trace ID to response headers for debugging
	if (traceId) {
		res.setHeader("X-Datadog-Trace-Id", traceId)
	}

	// Create child logger with request context including trace info
	const reqLogger = createChildLogger({
		requestId,
		...(traceId && { traceId }),
		...(spanId && { spanId })
	})

	// Attach logger to request for use in route handlers
	;(req as Request & { log: typeof reqLogger }).log = reqLogger

	// Record start time
	const startTime = Date.now()

	// Log when response finishes
	res.on("finish", () => {
		const duration = Date.now() - startTime
		const { method, originalUrl } = req
		const { statusCode } = res

		// Structured log with all relevant request metadata
		reqLogger.info(
			{
				method,
				path: originalUrl,
				statusCode,
				duration,
				userAgent: req.get("user-agent"),
				ip: req.ip
			},
			`${method} ${originalUrl} ${statusCode} ${duration}ms`
		)
	})

	next()
}
