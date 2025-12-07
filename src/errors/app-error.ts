/**
 * Base error class for all application errors
 * Extends Error to provide consistent error handling with HTTP status codes
 */
export class AppError extends Error {
	public readonly statusCode: number
	public readonly code: string
	public readonly details?: Record<string, unknown>
	public readonly isOperational: boolean

	constructor(
		message: string,
		statusCode: number,
		code: string,
		details?: Record<string, unknown>,
		isOperational = true
	) {
		super(message)
		this.statusCode = statusCode
		this.code = code
		if (details !== undefined) {
			this.details = details
		}
		this.isOperational = isOperational

		// Maintains proper stack trace for where error was thrown
		Error.captureStackTrace(this, this.constructor)

		// Set the prototype explicitly to fix instanceof checks
		Object.setPrototypeOf(this, AppError.prototype)
	}

	/**
	 * Convert error to JSON response format
	 */
	toJSON() {
		return {
			error: this.message,
			code: this.code,
			statusCode: this.statusCode,
			...(this.details && { details: this.details })
		}
	}
}
