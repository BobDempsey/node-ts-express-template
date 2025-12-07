import type { NextFunction, Request, Response } from "express"
import { AppError } from "@/errors"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

/**
 * Centralized error handler middleware
 * Catches all errors and returns consistent error responses
 * Logs errors with stack traces in development only
 */
export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	// Handle operational errors (AppError instances)
	if (err instanceof AppError) {
		// Log operational errors
		logger.error(`${err.code}: ${err.message}`)

		// In development, also log the stack trace
		if (env.NODE_ENV === "development" && err.stack) {
			logger.error(err.stack)
		}

		// Return the error response using toJSON()
		return res.status(err.statusCode).json(err.toJSON())
	}

	// Handle unexpected errors (non-operational)
	logger.error(`Unexpected Error: ${err.message}`)

	// In development, log the full stack trace
	if (env.NODE_ENV === "development" && err.stack) {
		logger.error(err.stack)
	}

	// Don't expose internal error details in production
	const response = {
		error:
			env.NODE_ENV === "development" ? err.message : "Internal Server Error",
		code: "INTERNAL_SERVER_ERROR",
		statusCode: 500,
		...(env.NODE_ENV === "development" && err.stack && { stack: err.stack })
	}

	return res.status(500).json(response)
}
