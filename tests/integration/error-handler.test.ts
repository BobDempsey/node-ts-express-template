/**
 * Integration Tests for Error Handler Middleware
 *
 * Test Coverage Plan:
 * 1. AppError Integration
 *    - Should handle AppError thrown in routes
 *    - Should return correct JSON response
 *    - Should set correct status code
 *
 * 2. Generic Error Integration
 *    - Should handle unexpected errors in routes
 *    - Should return 500 status
 *    - Should protect sensitive information
 *
 * 3. Error Response Format
 *    - Should return consistent JSON structure
 *    - Should handle various error types
 */

import express, {
	type NextFunction,
	type Request,
	type Response
} from "express"
import request from "supertest"
import { NotFoundError, ValidationError } from "@/errors"
import { errorHandler } from "@/middleware"

describe("Error Handler Middleware Integration", () => {
	let testApp: express.Application

	beforeEach(() => {
		// Create a fresh Express app for each test
		testApp = express()
		testApp.use(express.json())
	})

	describe("AppError Integration", () => {
		it("should handle ValidationError thrown in route", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new ValidationError("Email is required", { field: "email" })
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(400)
			expect(response.body).toHaveProperty("success", false)
			expect(response.body).toHaveProperty("error")
			expect(response.body.error).toEqual({
				message: "Email is required",
				code: "VALIDATION_ERROR",
				statusCode: 400,
				details: { field: "email" }
			})
			expect(response.body).toHaveProperty("meta")
		})

		it("should handle NotFoundError thrown in route", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new NotFoundError("User not found")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(404)
			expect(response.body).toHaveProperty("success", false)
			expect(response.body.error).toEqual({
				message: "User not found",
				code: "NOT_FOUND",
				statusCode: 404
			})
		})

		it("should handle AppError without details", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new ValidationError("Validation failed")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(400)
			expect(response.body).toHaveProperty("success", false)
			expect(response.body.error).toMatchObject({
				message: "Validation failed",
				code: "VALIDATION_ERROR",
				statusCode: 400
			})
			expect(response.body.error).not.toHaveProperty("details")
		})
	})

	describe("Generic Error Integration", () => {
		it("should handle unexpected errors in routes", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new Error("Unexpected error")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(500)
			expect(response.body).toHaveProperty("success", false)
			expect(response.body).toHaveProperty("error")
			expect(response.body.error).toHaveProperty(
				"code",
				"INTERNAL_SERVER_ERROR"
			)
			expect(response.body.error).toHaveProperty("statusCode", 500)
		})

		it("should handle async errors in routes", async () => {
			testApp.get("/test", async (_req: Request, _res: Response) => {
				await Promise.resolve()
				throw new ValidationError("Async error")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(400)
			expect(response.body.error.message).toBe("Async error")
		})

		it("should handle errors in middleware chain", async () => {
			// Middleware that throws error
			const errorMiddleware = (
				_req: Request,
				_res: Response,
				next: NextFunction
			) => {
				next(new ValidationError("Middleware error"))
			}

			testApp.get("/test", errorMiddleware, (_req: Request, _res: Response) => {
				_res.send("Should not reach here")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.status).toBe(400)
			expect(response.body.error.message).toBe("Middleware error")
		})
	})

	describe("Error Response Format", () => {
		it("should always return JSON content type", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new ValidationError("Test error")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return consistent error shape for all error types", async () => {
			const errors = [
				{ route: "/validation", error: new ValidationError("Test") },
				{ route: "/notfound", error: new NotFoundError("Test") },
				{ route: "/generic", error: new Error("Test") }
			]

			for (const { route, error } of errors) {
				testApp.get(route, (_req: Request, _res: Response) => {
					throw error
				})
			}
			testApp.use(errorHandler)

			for (const { route } of errors) {
				const response = await request(testApp).get(route)
				expect(response.body).toHaveProperty("success", false)
				expect(response.body).toHaveProperty("error")
				expect(response.body).toHaveProperty("meta")
				expect(response.body.error).toHaveProperty("message")
				expect(response.body.error).toHaveProperty("code")
				expect(response.body.error).toHaveProperty("statusCode")
				expect(typeof response.body.error.message).toBe("string")
				expect(typeof response.body.error.code).toBe("string")
				expect(typeof response.body.error.statusCode).toBe("number")
			}
		})
	})

	describe("Multiple Routes", () => {
		it("should handle errors from different routes independently", async () => {
			testApp.get("/route1", (_req: Request, _res: Response) => {
				throw new ValidationError("Route 1 error")
			})

			testApp.get("/route2", (_req: Request, _res: Response) => {
				throw new NotFoundError("Route 2 error")
			})

			testApp.use(errorHandler)

			const response1 = await request(testApp).get("/route1")
			expect(response1.status).toBe(400)
			expect(response1.body.error.message).toBe("Route 1 error")

			const response2 = await request(testApp).get("/route2")
			expect(response2.status).toBe(404)
			expect(response2.body.error.message).toBe("Route 2 error")
		})
	})

	describe("POST/PUT/DELETE Routes", () => {
		it("should handle errors in POST routes", async () => {
			testApp.post("/test", (_req: Request, _res: Response) => {
				throw new ValidationError("Invalid body")
			})
			testApp.use(errorHandler)

			const response = await request(testApp)
				.post("/test")
				.send({ data: "test" })

			expect(response.status).toBe(400)
			expect(response.body.error.message).toBe("Invalid body")
		})

		it("should handle errors in PUT routes", async () => {
			testApp.put("/test/:id", (_req: Request, _res: Response) => {
				throw new NotFoundError("Resource not found")
			})
			testApp.use(errorHandler)

			const response = await request(testApp)
				.put("/test/123")
				.send({ data: "test" })

			expect(response.status).toBe(404)
			expect(response.body.error.message).toBe("Resource not found")
		})

		it("should handle errors in DELETE routes", async () => {
			testApp.delete("/test/:id", (_req: Request, _res: Response) => {
				throw new NotFoundError("Cannot delete non-existent resource")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).delete("/test/123")

			expect(response.status).toBe(404)
			expect(response.body.error.message).toBe(
				"Cannot delete non-existent resource"
			)
		})
	})
})
