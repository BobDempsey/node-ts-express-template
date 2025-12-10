/**
 * Unit Tests for Error Handler Middleware (Pino-based)
 *
 * Test Coverage Plan:
 * 1. AppError Handling
 *    - Should return correct status code from AppError
 *    - Should return error response using toJSON()
 *    - Should log error with structured metadata
 *
 * 2. Generic Error Handling
 *    - Should return 500 for non-AppError instances
 *    - Should use generic error message in production
 *    - Should expose error message in development
 *    - Should include stack trace in development response
 *    - Should not include stack in production
 *
 * 3. Structured Logging
 *    - Should log errors with structured metadata (err, code, statusCode)
 *
 * 4. Response Format
 *    - Should always return JSON
 *    - Should have consistent error shape
 */

import type { NextFunction, Request, Response } from "express"
import { AppError, NotFoundError, ValidationError } from "@/errors"
import { errorHandler } from "@/middleware"

// Mock logger with pino-style interface
jest.mock("@/lib/logger", () => ({
	logger: {
		error: jest.fn(),
		info: jest.fn(),
		warn: jest.fn()
	}
}))

// Mock env
jest.mock("@/lib/env", () => ({
	default: {
		NODE_ENV: "test"
	}
}))

import env from "@/lib/env"
import { logger } from "@/lib/logger"

describe("errorHandler middleware", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let mockNext: NextFunction
	let jsonMock: jest.Mock
	let statusMock: jest.Mock

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup mock request
		mockRequest = {}

		// Setup mock response
		jsonMock = jest.fn()
		statusMock = jest.fn().mockReturnValue({ json: jsonMock })
		mockResponse = {
			status: statusMock,
			json: jsonMock
		}

		// Setup mock next function
		mockNext = jest.fn()
	})

	describe("AppError Handling", () => {
		it("should return correct status code from AppError", () => {
			const error = new ValidationError("Test validation error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(statusMock).toHaveBeenCalledWith(400)
		})

		it("should return error response using toJSON()", () => {
			const error = new ValidationError("Test error", { field: "email" })

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(jsonMock).toHaveBeenCalledWith({
				error: "Test error",
				code: "VALIDATION_ERROR",
				statusCode: 400,
				details: { field: "email" }
			})
		})

		it("should handle NotFoundError correctly", () => {
			const error = new NotFoundError("User not found")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(statusMock).toHaveBeenCalledWith(404)
			expect(jsonMock).toHaveBeenCalledWith({
				error: "User not found",
				code: "NOT_FOUND",
				statusCode: 404
			})
		})

		it("should log error with structured metadata for AppError", () => {
			const error = new ValidationError("Test error", { field: "email" })

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					err: error,
					code: "VALIDATION_ERROR",
					statusCode: 400,
					details: { field: "email" }
				}),
				"VALIDATION_ERROR: Test error"
			)
		})

		it("should log error message for AppError without details", () => {
			const error = new NotFoundError("Resource not found")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					err: error,
					code: "NOT_FOUND",
					statusCode: 404
				}),
				"NOT_FOUND: Resource not found"
			)
		})
	})

	describe("Generic Error Handling", () => {
		it("should return 500 for non-AppError instances", () => {
			const error = new Error("Unexpected error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(statusMock).toHaveBeenCalledWith(500)
		})

		it("should use generic error message in production", () => {
			const originalEnv = env.NODE_ENV
			;(env as { NODE_ENV: string }).NODE_ENV = "production"

			const error = new Error("Database connection failed")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(jsonMock).toHaveBeenCalledWith({
				error: "Internal Server Error",
				code: "INTERNAL_SERVER_ERROR",
				statusCode: 500
			})
			;(env as { NODE_ENV: string | undefined }).NODE_ENV = originalEnv
		})

		it("should expose error message in development", () => {
			const originalEnv = env.NODE_ENV
			;(env as { NODE_ENV: string }).NODE_ENV = "development"

			const error = new Error("Database connection failed")
			const stack = error.stack

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(jsonMock).toHaveBeenCalledWith({
				error: "Database connection failed",
				code: "INTERNAL_SERVER_ERROR",
				statusCode: 500,
				stack
			})
			;(env as { NODE_ENV: string | undefined }).NODE_ENV = originalEnv
		})

		it("should include stack trace in development response", () => {
			const originalEnv = env.NODE_ENV
			;(env as { NODE_ENV: string }).NODE_ENV = "development"

			const error = new Error("Test error")
			const stack = error.stack

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			const callArgs = jsonMock.mock.calls[0][0]
			expect(callArgs).toHaveProperty("stack", stack)
			;(env as { NODE_ENV: string | undefined }).NODE_ENV = originalEnv
		})

		it("should not include stack in production response", () => {
			const originalEnv = env.NODE_ENV
			;(env as { NODE_ENV: string }).NODE_ENV = "production"

			const error = new Error("Test error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			const callArgs = jsonMock.mock.calls[0][0]
			expect(callArgs).not.toHaveProperty("stack")
			;(env as { NODE_ENV: string | undefined }).NODE_ENV = originalEnv
		})

		it("should log unexpected errors with structured metadata", () => {
			const error = new Error("Unexpected error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(logger.error).toHaveBeenCalledWith(
				{ err: error },
				"Unexpected Error: Unexpected error"
			)
		})
	})

	describe("Response Format", () => {
		it("should always return JSON for AppError", () => {
			const error = new ValidationError("Test error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(jsonMock).toHaveBeenCalled()
			const response = jsonMock.mock.calls[0][0]
			expect(response).toHaveProperty("error")
			expect(response).toHaveProperty("code")
			expect(response).toHaveProperty("statusCode")
		})

		it("should always return JSON for generic errors", () => {
			const error = new Error("Test error")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(jsonMock).toHaveBeenCalled()
			const response = jsonMock.mock.calls[0][0]
			expect(response).toHaveProperty("error")
			expect(response).toHaveProperty("code")
			expect(response).toHaveProperty("statusCode")
		})

		it("should have consistent error shape for all errors", () => {
			const errors = [
				new ValidationError("Validation error"),
				new NotFoundError("Not found"),
				new Error("Generic error")
			]

			errors.forEach((error) => {
				jest.clearAllMocks()

				errorHandler(
					error,
					mockRequest as Request,
					mockResponse as Response,
					mockNext
				)

				const response = jsonMock.mock.calls[0][0]
				expect(typeof response.error).toBe("string")
				expect(typeof response.code).toBe("string")
				expect(typeof response.statusCode).toBe("number")
			})
		})
	})

	describe("Edge Cases", () => {
		it("should handle errors without stack trace", () => {
			const error = new Error("Test error")
			delete error.stack

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(statusMock).toHaveBeenCalledWith(500)
			expect(jsonMock).toHaveBeenCalled()
		})

		it("should handle AppError with no details", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			const response = jsonMock.mock.calls[0][0]
			expect(response).not.toHaveProperty("details")
		})

		it("should handle AppError with complex details", () => {
			const details = {
				fields: ["email", "password"],
				metadata: { timestamp: Date.now() }
			}
			const error = new ValidationError("Validation failed", details)

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			const response = jsonMock.mock.calls[0][0]
			expect(response.details).toEqual(details)
		})

		it("should handle error with empty message", () => {
			const error = new Error("")

			errorHandler(
				error,
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			)

			expect(statusMock).toHaveBeenCalledWith(500)
			expect(jsonMock).toHaveBeenCalled()
		})
	})
})
