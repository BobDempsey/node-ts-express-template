import * as Sentry from "@sentry/node"
import type { NextFunction, Request, Response } from "express"
import { AppError } from "@/errors"
import env from "@/lib/env"
import { logger } from "@/lib/logger"
import { sendError } from "@/utils"

/**
 * Centralized error handler middleware
 * Catches all errors and returns consistent error responses
 * Logs errors with structured metadata using Pino
 * Sends non-operational errors to Sentry
 */
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction
): void => {
	// Get request ID if available
	const requestId = (req as Request & { id?: string }).id

	// Handle operational errors (AppError instances)
	if (err instanceof AppError) {
		// Log operational errors with structured metadata
		logger.error(
			{
				err,
				code: err.code,
				statusCode: err.statusCode,
				details: err.details
			},
			`${err.code}: ${err.message}`
		)

		// Only send non-operational AppErrors to Sentry
		if (!err.isOperational) {
			Sentry.captureException(err, {
				extra: {
					code: err.code,
					statusCode: err.statusCode,
					details: err.details,
					requestId
				},
				tags: {
					errorType: "AppError",
					isOperational: "false"
				}
			})
		}

		// Return the error response using standardized format
		sendError(res, err.message, err.code, err.statusCode, err.details)
		return
	}

	// Handle unexpected errors (non-operational)
	logger.error({ err }, `Unexpected Error: ${err.message}`)

	// Send all unexpected errors to Sentry
	Sentry.captureException(err, {
		extra: {
			requestId,
			path: req.path,
			method: req.method
		},
		tags: {
			errorType: "UnexpectedError"
		}
	})

	// Don't expose internal error details in production
	const message =
		env.NODE_ENV === "development" ? err.message : "Internal Server Error"
	const details =
		env.NODE_ENV === "development" && err.stack
			? { stack: err.stack }
			: undefined

	sendError(res, message, "INTERNAL_SERVER_ERROR", 500, details)
}
