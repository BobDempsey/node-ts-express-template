import { AppError } from "./app-error"

/**
 * Error thrown when request validation fails
 * Used for malformed requests, invalid parameters, etc.
 */
export class ValidationError extends AppError {
	constructor(
		message = "Validation failed",
		details?: Record<string, unknown>
	) {
		super(message, 400, "VALIDATION_ERROR", details)
		Object.setPrototypeOf(this, ValidationError.prototype)
	}
}
