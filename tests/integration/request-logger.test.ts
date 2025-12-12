/**
 * Integration Tests for Request Logger Middleware (Pino-based)
 *
 * Test Coverage Plan:
 * 1. Request Logging Integration
 *    - Should log successful GET requests
 *    - Should log successful POST requests
 *    - Should log failed requests (4xx, 5xx)
 *
 * 2. Request ID Integration
 *    - Should include X-Request-Id in response headers
 *    - Should generate unique IDs for concurrent requests
 *
 * 3. Different HTTP Methods
 *    - Should log GET, POST, PUT, PATCH, DELETE requests
 *    - Should handle all methods consistently
 *
 * 4. Error Scenarios
 *    - Should log requests that result in errors
 *    - Should log 404 responses
 *    - Should log 500 responses
 */

import express, { type Request, type Response } from "express"
import request from "supertest"
import { NotFoundError, ValidationError } from "@/errors"
import { errorHandler, requestLogger } from "@/middleware"

// Mock createChildLogger from logger
const mockChildLoggerInfo = jest.fn()
const mockChildLogger = {
	info: mockChildLoggerInfo,
	error: jest.fn(),
	warn: jest.fn(),
	debug: jest.fn()
}

jest.mock("@/lib/logger", () => ({
	createChildLogger: jest.fn(() => mockChildLogger),
	getTraceContext: jest.fn(() => ({ trace_id: "", span_id: "" })),
	logger: {
		info: jest.fn(),
		error: jest.fn(),
		warn: jest.fn()
	}
}))

describe("Request Logger Middleware Integration", () => {
	let testApp: express.Application

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks()

		// Create a fresh Express app for each test
		testApp = express()
		testApp.use(express.json())
		testApp.use(requestLogger)
	})

	describe("Request Logging Integration", () => {
		it("should log successful GET requests", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ message: "success" })
			})

			await request(testApp).get("/test")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toMatchObject({
				method: "GET",
				path: "/test",
				statusCode: 200
			})
			expect(logCall[1]).toContain("GET")
			expect(logCall[1]).toContain("/test")
			expect(logCall[1]).toContain("200")
		})

		it("should log successful POST requests", async () => {
			testApp.post("/test", (_req: Request, res: Response) => {
				res.status(201).json({ message: "created" })
			})

			await request(testApp).post("/test").send({ data: "test" })

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toMatchObject({
				method: "POST",
				path: "/test",
				statusCode: 201
			})
		})

		it("should log failed requests with 4xx status", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new ValidationError("Validation failed")
			})
			testApp.use(errorHandler)

			await request(testApp).get("/test")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toMatchObject({
				method: "GET",
				path: "/test",
				statusCode: 400
			})
		})

		it("should log failed requests with 5xx status", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new Error("Internal error")
			})
			testApp.use(errorHandler)

			await request(testApp).get("/test")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toMatchObject({
				method: "GET",
				path: "/test",
				statusCode: 500
			})
		})
	})

	describe("Request ID Integration", () => {
		it("should include X-Request-Id in response headers", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ message: "success" })
			})

			const response = await request(testApp).get("/test")

			expect(response.headers["x-request-id"]).toBeDefined()
			expect(typeof response.headers["x-request-id"]).toBe("string")
			expect(
				(response.headers["x-request-id"] as string).length
			).toBeGreaterThan(0)
		})

		it("should include X-Request-Id even for error responses", async () => {
			testApp.get("/test", (_req: Request, _res: Response) => {
				throw new NotFoundError("Not found")
			})
			testApp.use(errorHandler)

			const response = await request(testApp).get("/test")

			expect(response.headers["x-request-id"]).toBeDefined()
		})

		it("should generate different IDs for different requests", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ message: "success" })
			})

			const response1 = await request(testApp).get("/test")
			const response2 = await request(testApp).get("/test")

			expect(response1.headers["x-request-id"]).toBeDefined()
			expect(response2.headers["x-request-id"]).toBeDefined()
			expect(response1.headers["x-request-id"]).not.toBe(
				response2.headers["x-request-id"]
			)
		})
	})

	describe("Different HTTP Methods", () => {
		it("should log GET requests", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ method: "GET" })
			})

			await request(testApp).get("/test")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].method).toBe("GET")
		})

		it("should log POST requests", async () => {
			testApp.post("/test", (_req: Request, res: Response) => {
				res.json({ method: "POST" })
			})

			await request(testApp).post("/test").send({ data: "test" })

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].method).toBe("POST")
		})

		it("should log PUT requests", async () => {
			testApp.put("/test/:id", (_req: Request, res: Response) => {
				res.json({ method: "PUT" })
			})

			await request(testApp).put("/test/123").send({ data: "test" })

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].method).toBe("PUT")
			expect(logCall[0].path).toBe("/test/123")
		})

		it("should log PATCH requests", async () => {
			testApp.patch("/test/:id", (_req: Request, res: Response) => {
				res.json({ method: "PATCH" })
			})

			await request(testApp).patch("/test/456").send({ data: "test" })

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].method).toBe("PATCH")
			expect(logCall[0].path).toBe("/test/456")
		})

		it("should log DELETE requests", async () => {
			testApp.delete("/test/:id", (_req: Request, res: Response) => {
				res.status(204).send()
			})

			await request(testApp).delete("/test/789")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].method).toBe("DELETE")
			expect(logCall[0].path).toBe("/test/789")
		})
	})

	describe("Response Time Tracking", () => {
		it("should include response time in logs", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ message: "success" })
			})

			await request(testApp).get("/test")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toHaveProperty("duration")
			expect(typeof logCall[0].duration).toBe("number")
		})

		it("should track time for slow requests", async () => {
			testApp.get("/slow", async (_req: Request, res: Response) => {
				await new Promise((resolve) => setTimeout(resolve, 50))
				res.json({ message: "slow response" })
			})

			await request(testApp).get("/slow")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].duration).toBeGreaterThanOrEqual(50)
		})
	})

	describe("Query Parameters and Paths", () => {
		it("should log full path including query parameters", async () => {
			testApp.get("/search", (_req: Request, res: Response) => {
				res.json({ results: [] })
			})

			await request(testApp).get("/search?q=test&page=1")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].path).toBe("/search?q=test&page=1")
		})

		it("should log path parameters", async () => {
			testApp.get("/users/:id", (_req: Request, res: Response) => {
				res.json({ user: "test" })
			})

			await request(testApp).get("/users/123")

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].path).toBe("/users/123")
		})

		it("should handle complex URLs", async () => {
			testApp.get("/api/v1/users/:id/posts", (_req: Request, res: Response) => {
				res.json({ posts: [] })
			})

			await request(testApp).get(
				"/api/v1/users/123/posts?filter=recent&limit=10"
			)

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].path).toBe(
				"/api/v1/users/123/posts?filter=recent&limit=10"
			)
		})
	})

	describe("Error Scenarios", () => {
		it("should log 404 responses", async () => {
			// No routes defined, should 404
			await request(testApp).get("/nonexistent")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].statusCode).toBe(404)
		})

		it("should log requests that throw errors", async () => {
			testApp.get("/error", (_req: Request, _res: Response) => {
				throw new ValidationError("Test error")
			})
			testApp.use(errorHandler)

			await request(testApp).get("/error")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].path).toBe("/error")
		})

		it("should log requests that result in 500 errors", async () => {
			testApp.get("/server-error", (_req: Request, _res: Response) => {
				throw new Error("Internal server error")
			})
			testApp.use(errorHandler)

			await request(testApp).get("/server-error")

			expect(mockChildLoggerInfo).toHaveBeenCalled()
			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0].statusCode).toBe(500)
		})
	})

	describe("Multiple Requests", () => {
		it("should log each request independently", async () => {
			testApp.get("/test1", (_req: Request, res: Response) => {
				res.json({ route: "test1" })
			})

			testApp.get("/test2", (_req: Request, res: Response) => {
				res.json({ route: "test2" })
			})

			await request(testApp).get("/test1")
			await request(testApp).get("/test2")

			expect(mockChildLoggerInfo).toHaveBeenCalledTimes(2)

			const log1 = mockChildLoggerInfo.mock.calls[0]
			const log2 = mockChildLoggerInfo.mock.calls[1]

			expect(log1[0].path).toBe("/test1")
			expect(log2[0].path).toBe("/test2")
		})

		it("should handle concurrent requests", async () => {
			testApp.get("/test", (_req: Request, res: Response) => {
				res.json({ message: "success" })
			})

			// Make 3 concurrent requests
			await Promise.all([
				request(testApp).get("/test"),
				request(testApp).get("/test"),
				request(testApp).get("/test")
			])

			expect(mockChildLoggerInfo).toHaveBeenCalledTimes(3)
		})
	})
})
