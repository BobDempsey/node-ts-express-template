import { AppError } from "./app-error"

/**
 * Error thrown when authentication is required but not provided or invalid
 * Used for 401 responses
 */
export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", details?: Record<string, unknown>) {
		super(message, 401, "UNAUTHORIZED", details)
		Object.setPrototypeOf(this, UnauthorizedError.prototype)
	}
}
