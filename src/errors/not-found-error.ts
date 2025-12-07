import { AppError } from "./app-error"

/**
 * Error thrown when a requested resource is not found
 * Used for 404 responses
 */
export class NotFoundError extends AppError {
	constructor(
		message = "Resource not found",
		details?: Record<string, unknown>
	) {
		super(message, 404, "NOT_FOUND", details)
		Object.setPrototypeOf(this, NotFoundError.prototype)
	}
}
