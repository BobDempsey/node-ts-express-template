import type { NextFunction, Request, Response } from "express"
import { AppError } from "@/errors"
import env from "@/lib/env"
import { logger } from "@/lib/logger"

/**
 * Centralized error handler middleware
 * Catches all errors and returns consistent error responses
 * Logs errors with structured metadata using Pino
 */
export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
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

		// Return the error response using toJSON()
		res.status(err.statusCode).json(err.toJSON())
		return
	}

	// Handle unexpected errors (non-operational)
	logger.error({ err }, `Unexpected Error: ${err.message}`)

	// Don't expose internal error details in production
	const response = {
		error:
			env.NODE_ENV === "development" ? err.message : "Internal Server Error",
		code: "INTERNAL_SERVER_ERROR",
		statusCode: 500,
		...(env.NODE_ENV === "development" && err.stack && { stack: err.stack })
	}

	res.status(500).json(response)
}
