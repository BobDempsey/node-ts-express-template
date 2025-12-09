import type { Request, Response } from "express"
import rateLimit from "express-rate-limit"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

/**
 * Paths to exclude from rate limiting
 * Health checks and documentation should always be accessible
 */
const EXCLUDED_PATHS = ["/health", "/ready", "/live", "/docs"]

/**
 * Check if a request path should be excluded from rate limiting
 */
const shouldSkip = (req: Request): boolean => {
	const path = req.path
	return EXCLUDED_PATHS.some(
		(excluded) => path === excluded || path.startsWith(`${excluded}/`)
	)
}

/**
 * Rate limiting middleware using express-rate-limit
 *
 * Features:
 * - Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX_REQUESTS env vars
 * - Skips health check and documentation endpoints
 * - Returns JSON error response matching AppError format
 * - Logs rate limit events with request ID context
 * - Includes standard rate limit headers
 */
export const rateLimiter = rateLimit({
	// Time window in milliseconds (default: 1 minute)
	windowMs: env.RATE_LIMIT_WINDOW_MS ?? 60000,

	// Max requests per window (default: 100)
	limit: env.RATE_LIMIT_MAX_REQUESTS ?? 100,

	// Use standard rate limit headers
	standardHeaders: "draft-7",
	legacyHeaders: false,

	// Skip rate limiting for excluded paths
	skip: shouldSkip,

	// Custom handler for rate limit exceeded
	handler: (req: Request, res: Response) => {
		const requestId = (req as Request & { id?: string }).id

		// Log the rate limit event
		logger.warn(
			{
				requestId,
				ip: req.ip,
				path: req.path,
				method: req.method
			},
			`Rate limit exceeded for ${req.ip}`
		)

		// Return JSON response matching AppError format
		res.status(429).json({
			error: "Too many requests, please try again later",
			code: "RATE_LIMIT_EXCEEDED",
			statusCode: 429
		})
	},

	// Key generator - use IP address (handles both IPv4 and IPv6)
	keyGenerator: (req: Request): string => {
		return req.ip || req.socket.remoteAddress || "unknown"
	},

	// Disable validation checks that don't apply to our setup
	// - xForwardedForHeader: We handle proxy headers at infrastructure level
	// - keyGeneratorIpFallback: Our keyGenerator handles all IP formats
	validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false }
})
