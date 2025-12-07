/**
 * Unit Tests for errors
 *
 * Test Coverage Plan:
 * 1. AppError (Base Class)
 *    - Should extend Error
 *    - Should set statusCode correctly
 *    - Should set code correctly
 *    - Should set message correctly
 *    - Should handle optional details
 *    - Should set isOperational flag
 *    - Should maintain proper stack trace
 *    - Should fix instanceof checks with prototype
 *    - toJSON() should return correct shape
 *
 * 2. ValidationError
 *    - Should extend AppError
 *    - Should set statusCode to 400
 *    - Should set code to VALIDATION_ERROR
 *    - Should use default message
 *    - Should accept custom message
 *    - Should handle details
 *    - Should maintain instanceof checks
 *
 * 3. NotFoundError
 *    - Should extend AppError
 *    - Should set statusCode to 404
 *    - Should set code to NOT_FOUND
 *    - Should use default message
 *    - Should accept custom message
 *    - Should handle details
 *    - Should maintain instanceof checks
 *
 * 4. UnauthorizedError
 *    - Should extend AppError
 *    - Should set statusCode to 401
 *    - Should set code to UNAUTHORIZED
 *    - Should use default message
 *    - Should accept custom message
 *    - Should handle details
 *    - Should maintain instanceof checks
 *
 * 5. Error Response Shape
 *    - toJSON() should return consistent shape across all error types
 *    - Should include error, code, statusCode fields
 *    - Should conditionally include details
 */

import {
	AppError,
	NotFoundError,
	UnauthorizedError,
	ValidationError
} from "@/errors"

describe("errors", () => {
	describe("AppError", () => {
		it("should extend Error", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error).toBeInstanceOf(Error)
			expect(error).toBeInstanceOf(AppError)
		})

		it("should set statusCode correctly", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error.statusCode).toBe(500)
		})

		it("should set code correctly", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error.code).toBe("TEST_ERROR")
		})

		it("should set message correctly", () => {
			const message = "This is a test error"
			const error = new AppError(message, 500, "TEST_ERROR")
			expect(error.message).toBe(message)
		})

		it("should handle optional details", () => {
			const details = { field: "email", reason: "invalid format" }
			const error = new AppError("Test error", 400, "TEST_ERROR", details)
			expect(error.details).toEqual(details)
		})

		it("should not have details when not provided", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error.details).toBeUndefined()
		})

		it("should set isOperational flag to true by default", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error.isOperational).toBe(true)
		})

		it("should allow overriding isOperational flag", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR", {}, false)
			expect(error.isOperational).toBe(false)
		})

		it("should maintain proper stack trace", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error.stack).toBeDefined()
			expect(typeof error.stack).toBe("string")
			expect(error.stack?.length).toBeGreaterThan(0)
		})

		it("should support instanceof checks", () => {
			const error = new AppError("Test error", 500, "TEST_ERROR")
			expect(error instanceof AppError).toBe(true)
			expect(error instanceof Error).toBe(true)
		})

		describe("toJSON()", () => {
			it("should return correct shape without details", () => {
				const error = new AppError("Test error", 500, "TEST_ERROR")
				const json = error.toJSON()

				expect(json).toEqual({
					error: "Test error",
					code: "TEST_ERROR",
					statusCode: 500
				})
			})

			it("should return correct shape with details", () => {
				const details = { field: "email" }
				const error = new AppError("Test error", 400, "TEST_ERROR", details)
				const json = error.toJSON()

				expect(json).toEqual({
					error: "Test error",
					code: "TEST_ERROR",
					statusCode: 400,
					details: { field: "email" }
				})
			})

			it("should not include details key when details is undefined", () => {
				const error = new AppError("Test error", 500, "TEST_ERROR")
				const json = error.toJSON()

				expect(json).not.toHaveProperty("details")
			})
		})
	})

	describe("ValidationError", () => {
		it("should extend AppError", () => {
			const error = new ValidationError()
			expect(error).toBeInstanceOf(AppError)
			expect(error).toBeInstanceOf(Error)
		})

		it("should set statusCode to 400", () => {
			const error = new ValidationError()
			expect(error.statusCode).toBe(400)
		})

		it("should set code to VALIDATION_ERROR", () => {
			const error = new ValidationError()
			expect(error.code).toBe("VALIDATION_ERROR")
		})

		it("should use default message", () => {
			const error = new ValidationError()
			expect(error.message).toBe("Validation failed")
		})

		it("should accept custom message", () => {
			const customMessage = "Email is required"
			const error = new ValidationError(customMessage)
			expect(error.message).toBe(customMessage)
		})

		it("should handle details", () => {
			const details = { field: "email", reason: "invalid format" }
			const error = new ValidationError("Validation failed", details)
			expect(error.details).toEqual(details)
		})

		it("should support instanceof checks", () => {
			const error = new ValidationError()
			expect(error instanceof ValidationError).toBe(true)
			expect(error instanceof AppError).toBe(true)
			expect(error instanceof Error).toBe(true)
		})

		it("should be operational by default", () => {
			const error = new ValidationError()
			expect(error.isOperational).toBe(true)
		})

		it("should return correct JSON shape", () => {
			const error = new ValidationError("Invalid input", {
				field: "username"
			})
			const json = error.toJSON()

			expect(json).toEqual({
				error: "Invalid input",
				code: "VALIDATION_ERROR",
				statusCode: 400,
				details: { field: "username" }
			})
		})
	})

	describe("NotFoundError", () => {
		it("should extend AppError", () => {
			const error = new NotFoundError()
			expect(error).toBeInstanceOf(AppError)
			expect(error).toBeInstanceOf(Error)
		})

		it("should set statusCode to 404", () => {
			const error = new NotFoundError()
			expect(error.statusCode).toBe(404)
		})

		it("should set code to NOT_FOUND", () => {
			const error = new NotFoundError()
			expect(error.code).toBe("NOT_FOUND")
		})

		it("should use default message", () => {
			const error = new NotFoundError()
			expect(error.message).toBe("Resource not found")
		})

		it("should accept custom message", () => {
			const customMessage = "User not found"
			const error = new NotFoundError(customMessage)
			expect(error.message).toBe(customMessage)
		})

		it("should handle details", () => {
			const details = { resourceType: "user", id: "123" }
			const error = new NotFoundError("User not found", details)
			expect(error.details).toEqual(details)
		})

		it("should support instanceof checks", () => {
			const error = new NotFoundError()
			expect(error instanceof NotFoundError).toBe(true)
			expect(error instanceof AppError).toBe(true)
			expect(error instanceof Error).toBe(true)
		})

		it("should be operational by default", () => {
			const error = new NotFoundError()
			expect(error.isOperational).toBe(true)
		})

		it("should return correct JSON shape", () => {
			const error = new NotFoundError("User not found", { id: "123" })
			const json = error.toJSON()

			expect(json).toEqual({
				error: "User not found",
				code: "NOT_FOUND",
				statusCode: 404,
				details: { id: "123" }
			})
		})
	})

	describe("UnauthorizedError", () => {
		it("should extend AppError", () => {
			const error = new UnauthorizedError()
			expect(error).toBeInstanceOf(AppError)
			expect(error).toBeInstanceOf(Error)
		})

		it("should set statusCode to 401", () => {
			const error = new UnauthorizedError()
			expect(error.statusCode).toBe(401)
		})

		it("should set code to UNAUTHORIZED", () => {
			const error = new UnauthorizedError()
			expect(error.code).toBe("UNAUTHORIZED")
		})

		it("should use default message", () => {
			const error = new UnauthorizedError()
			expect(error.message).toBe("Unauthorized")
		})

		it("should accept custom message", () => {
			const customMessage = "Invalid credentials"
			const error = new UnauthorizedError(customMessage)
			expect(error.message).toBe(customMessage)
		})

		it("should handle details", () => {
			const details = { reason: "token expired" }
			const error = new UnauthorizedError("Unauthorized", details)
			expect(error.details).toEqual(details)
		})

		it("should support instanceof checks", () => {
			const error = new UnauthorizedError()
			expect(error instanceof UnauthorizedError).toBe(true)
			expect(error instanceof AppError).toBe(true)
			expect(error instanceof Error).toBe(true)
		})

		it("should be operational by default", () => {
			const error = new UnauthorizedError()
			expect(error.isOperational).toBe(true)
		})

		it("should return correct JSON shape", () => {
			const error = new UnauthorizedError("Invalid token", {
				reason: "expired"
			})
			const json = error.toJSON()

			expect(json).toEqual({
				error: "Invalid token",
				code: "UNAUTHORIZED",
				statusCode: 401,
				details: { reason: "expired" }
			})
		})
	})

	describe("Error Response Shape Consistency", () => {
		it("should have consistent shape across all error types", () => {
			const validationError = new ValidationError("Validation failed")
			const notFoundError = new NotFoundError("Not found")
			const unauthorizedError = new UnauthorizedError("Unauthorized")

			const errors = [validationError, notFoundError, unauthorizedError]

			errors.forEach((error) => {
				const json = error.toJSON()
				expect(json).toHaveProperty("error")
				expect(json).toHaveProperty("code")
				expect(json).toHaveProperty("statusCode")
				expect(typeof json.error).toBe("string")
				expect(typeof json.code).toBe("string")
				expect(typeof json.statusCode).toBe("number")
			})
		})

		it("should conditionally include details in all error types", () => {
			const details = { test: "value" }
			const validationError = new ValidationError("Test", details)
			const notFoundError = new NotFoundError("Test", details)
			const unauthorizedError = new UnauthorizedError("Test", details)

			expect(validationError.toJSON()).toHaveProperty("details", details)
			expect(notFoundError.toJSON()).toHaveProperty("details", details)
			expect(unauthorizedError.toJSON()).toHaveProperty("details", details)
		})

		it("should not include details when not provided", () => {
			const validationError = new ValidationError()
			const notFoundError = new NotFoundError()
			const unauthorizedError = new UnauthorizedError()

			expect(validationError.toJSON()).not.toHaveProperty("details")
			expect(notFoundError.toJSON()).not.toHaveProperty("details")
			expect(unauthorizedError.toJSON()).not.toHaveProperty("details")
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty error messages", () => {
			const error = new AppError("", 500, "TEST_ERROR")
			expect(error.message).toBe("")
		})

		it("should handle complex details objects", () => {
			const complexDetails = {
				field: "email",
				errors: ["required", "invalid format"],
				metadata: {
					timestamp: Date.now(),
					source: "validation"
				}
			}
			const error = new ValidationError("Validation failed", complexDetails)
			expect(error.details).toEqual(complexDetails)
			expect(error.toJSON().details).toEqual(complexDetails)
		})

		it("should handle nested error creation", () => {
			try {
				throw new ValidationError("Test error")
			} catch (error) {
				expect(error).toBeInstanceOf(ValidationError)
				expect(error).toBeInstanceOf(AppError)
				expect(error).toBeInstanceOf(Error)
			}
		})

		it("should maintain stack trace through inheritance", () => {
			const validationError = new ValidationError()
			const notFoundError = new NotFoundError()
			const unauthorizedError = new UnauthorizedError()

			expect(validationError.stack).toBeDefined()
			expect(notFoundError.stack).toBeDefined()
			expect(unauthorizedError.stack).toBeDefined()

			expect(typeof validationError.stack).toBe("string")
			expect(typeof notFoundError.stack).toBe("string")
			expect(typeof unauthorizedError.stack).toBe("string")

			expect(validationError.stack?.length).toBeGreaterThan(0)
			expect(notFoundError.stack?.length).toBeGreaterThan(0)
			expect(unauthorizedError.stack?.length).toBeGreaterThan(0)
		})
	})
})
