/**
 * Unit Tests for Validate Middleware
 *
 * Test Coverage Plan:
 * 1. Request Body Validation
 *    - Should validate request body successfully
 *    - Should throw ValidationError for invalid body
 *    - Should replace body with parsed data
 *    - Should apply default values from schema
 *
 * 2. Request Params Validation
 *    - Should validate request params successfully
 *    - Should throw ValidationError for invalid params
 *    - Should handle type coercion (e.g., string to number)
 *
 * 3. Request Query Validation
 *    - Should validate request query successfully
 *    - Should throw ValidationError for invalid query
 *    - Should handle optional query parameters
 *
 * 4. Error Formatting
 *    - Should format Zod errors into readable structure
 *    - Should handle multiple validation errors
 *    - Should include field paths in error details
 *
 * 5. Edge Cases
 *    - Should handle empty objects
 *    - Should handle missing required fields
 *    - Should handle nested object validation
 */

import type { NextFunction, Request, Response } from "express"
import { z } from "zod"
import { ValidationError } from "@/errors"
import { validate } from "@/middleware"

describe("validate middleware", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let mockNext: NextFunction

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup mock request
		mockRequest = {
			body: {},
			params: {},
			query: {}
		}

		// Setup mock response
		mockResponse = {}

		// Setup mock next function
		mockNext = jest.fn()
	})

	describe("Request Body Validation", () => {
		it("should validate request body successfully", () => {
			const schema = z.object({
				name: z.string(),
				email: z.string().email()
			})

			mockRequest.body = {
				name: "John Doe",
				email: "john@example.com"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
		})

		it("should throw ValidationError for invalid body", () => {
			const schema = z.object({
				email: z.string().email()
			})

			mockRequest.body = {
				email: "invalid-email"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError))
			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.message).toBe("Validation failed for request body")
		})

		it("should replace body with parsed data", () => {
			const schema = z.object({
				name: z.string(),
				age: z.number().optional().default(18)
			})

			mockRequest.body = {
				name: "John Doe"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockRequest.body).toEqual({
				name: "John Doe",
				age: 18
			})
		})

		it("should apply default values from schema", () => {
			const schema = z.object({
				name: z.string(),
				active: z.boolean().default(true)
			})

			mockRequest.body = {
				name: "John Doe"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockRequest.body.active).toBe(true)
		})

		it("should handle type coercion", () => {
			const schema = z.object({
				age: z.coerce.number()
			})

			mockRequest.body = {
				age: "25"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockRequest.body.age).toBe(25)
			expect(typeof mockRequest.body.age).toBe("number")
		})
	})

	describe("Request Params Validation", () => {
		it("should validate request params successfully", () => {
			const schema = z.object({
				id: z.string().uuid()
			})

			mockRequest.params = {
				id: "123e4567-e89b-12d3-a456-426614174000"
			}

			const middleware = validate(schema, "params")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
		})

		it("should throw ValidationError for invalid params", () => {
			const schema = z.object({
				id: z.string().uuid()
			})

			mockRequest.params = {
				id: "not-a-uuid"
			}

			const middleware = validate(schema, "params")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError))
			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.message).toBe("Validation failed for request params")
		})

		it("should handle numeric ID coercion", () => {
			const schema = z.object({
				id: z.coerce.number()
			})

			mockRequest.params = {
				id: "123"
			}

			const middleware = validate(schema, "params")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockRequest.params.id).toBe(123)
		})
	})

	describe("Request Query Validation", () => {
		it("should validate request query successfully", () => {
			const schema = z.object({
				page: z.coerce.number(),
				limit: z.coerce.number()
			})

			mockRequest.query = {
				page: "1",
				limit: "10"
			}

			const middleware = validate(schema, "query")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
			expect(mockRequest.query).toEqual({
				page: 1,
				limit: 10
			})
		})

		it("should throw ValidationError for invalid query", () => {
			const schema = z.object({
				page: z.coerce.number().positive()
			})

			mockRequest.query = {
				page: "-1"
			}

			const middleware = validate(schema, "query")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError))
		})

		it("should handle optional query parameters", () => {
			const schema = z.object({
				search: z.string().optional(),
				page: z.coerce.number().default(1)
			})

			mockRequest.query = {}

			const middleware = validate(schema, "query")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockRequest.query).toEqual({
				page: 1
			})
		})
	})

	describe("Error Formatting", () => {
		it("should format Zod errors into readable structure", () => {
			const schema = z.object({
				email: z.string().email()
			})

			mockRequest.body = {
				email: "invalid"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.details).toBeDefined()
			expect(error.details).toHaveProperty("email")
		})

		it("should handle multiple validation errors", () => {
			const schema = z.object({
				name: z.string().min(3),
				email: z.string().email(),
				age: z.number().min(18)
			})

			mockRequest.body = {
				name: "Jo",
				email: "invalid",
				age: 15
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.details).toHaveProperty("name")
			expect(error.details).toHaveProperty("email")
			expect(error.details).toHaveProperty("age")
		})

		it("should include field paths in error details", () => {
			const schema = z.object({
				user: z.object({
					name: z.string().min(1)
				})
			})

			mockRequest.body = {
				user: {
					name: ""
				}
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.details).toHaveProperty(["user.name"])
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty objects", () => {
			const schema = z.object({
				name: z.string()
			})

			mockRequest.body = {}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError))
		})

		it("should handle missing required fields", () => {
			const schema = z.object({
				name: z.string(),
				email: z.string()
			})

			mockRequest.body = {
				name: "John"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			const error = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError
			expect(error.details).toHaveProperty("email")
		})

		it("should handle nested object validation", () => {
			const schema = z.object({
				user: z.object({
					name: z.string(),
					profile: z.object({
						age: z.number()
					})
				})
			})

			mockRequest.body = {
				user: {
					name: "John",
					profile: {
						age: 25
					}
				}
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
		})

		it("should validate with strict mode by default", () => {
			const schema = z.object({
				name: z.string()
			})

			mockRequest.body = {
				name: "John",
				extraField: "should be stripped"
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
			expect(mockRequest.body).toEqual({
				name: "John"
			})
		})

		it("should handle array validation", () => {
			const schema = z.object({
				tags: z.array(z.string())
			})

			mockRequest.body = {
				tags: ["tag1", "tag2", "tag3"]
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
		})

		it("should handle invalid array items", () => {
			const schema = z.object({
				ids: z.array(z.number())
			})

			mockRequest.body = {
				ids: [1, 2, "not-a-number"]
			}

			const middleware = validate(schema, "body")
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError))
		})
	})

	describe("Default Target", () => {
		it("should default to body validation when target not specified", () => {
			const schema = z.object({
				name: z.string()
			})

			mockRequest.body = {
				name: "John"
			}

			const middleware = validate(schema)
			middleware(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalledWith()
		})
	})
})
