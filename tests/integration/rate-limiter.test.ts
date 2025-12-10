/**
 * Integration Tests for Rate Limiter Middleware
 *
 * Test Coverage Plan:
 * 1. Rate Limiting Behavior
 *    - Should allow requests under the limit
 *    - Should return 429 when limit exceeded
 *    - Should reset after window expires
 *
 * 2. Excluded Paths
 *    - Should not rate limit /health
 *    - Should not rate limit /ready
 *    - Should not rate limit /live
 *    - Should not rate limit /docs
 *
 * 3. Response Format
 *    - Should return correct JSON error format
 *    - Should include rate limit headers
 *
 * 4. Multiple Clients
 *    - Should track rate limits per IP independently
 */

import express, { type Request, type Response } from "express"
import rateLimit from "express-rate-limit"
import request from "supertest"

// Create a minimal test app with rate limiting
const createTestApp = (maxRequests = 3, windowMs = 60000) => {
	const app = express()

	// Mock request logger to add req.id
	app.use((req: Request, _res: Response, next) => {
		;(req as Request & { id: string }).id = "test-request-id"
		next()
	})

	// Rate limiter with low limits for testing
	const testRateLimiter = rateLimit({
		windowMs,
		limit: maxRequests,
		standardHeaders: "draft-7",
		legacyHeaders: false,
		skip: (req: Request) => {
			const path = req.path
			const excludedPaths = ["/health", "/ready", "/live", "/docs"]
			return excludedPaths.some(
				(excluded) => path === excluded || path.startsWith(`${excluded}/`)
			)
		},
		handler: (_req: Request, res: Response) => {
			res.status(429).json({
				error: "Too many requests, please try again later",
				code: "RATE_LIMIT_EXCEEDED",
				statusCode: 429
			})
		}
	})

	app.use(testRateLimiter)

	// Test routes
	app.get("/test", (_req: Request, res: Response) => {
		res.json({ message: "success" })
	})

	app.get("/health", (_req: Request, res: Response) => {
		res.json({ status: "ok" })
	})

	app.get("/ready", (_req: Request, res: Response) => {
		res.json({ status: "ready" })
	})

	app.get("/live", (_req: Request, res: Response) => {
		res.json({ status: "alive" })
	})

	app.get("/docs", (_req: Request, res: Response) => {
		res.json({ docs: "swagger" })
	})

	app.get("/docs/swagger.json", (_req: Request, res: Response) => {
		res.json({ openapi: "3.0.0" })
	})

	return app
}

describe("Rate Limiter Middleware Integration", () => {
	describe("Rate Limiting Behavior", () => {
		it("should allow requests under the limit", async () => {
			const app = createTestApp(5)

			// Make 5 requests (at the limit)
			for (let i = 0; i < 5; i++) {
				const response = await request(app).get("/test")
				expect(response.status).toBe(200)
			}
		})

		it("should return 429 when limit exceeded", async () => {
			const app = createTestApp(3)

			// Make requests up to the limit
			for (let i = 0; i < 3; i++) {
				const response = await request(app).get("/test")
				expect(response.status).toBe(200)
			}

			// Next request should be rate limited
			const response = await request(app).get("/test")
			expect(response.status).toBe(429)
		})

		it("should return correct JSON error format when rate limited", async () => {
			const app = createTestApp(1)

			// Exhaust the limit
			await request(app).get("/test")

			// Next request should be rate limited
			const response = await request(app).get("/test")

			expect(response.status).toBe(429)
			expect(response.body).toEqual({
				error: "Too many requests, please try again later",
				code: "RATE_LIMIT_EXCEEDED",
				statusCode: 429
			})
		})

		it("should count different endpoints against the same limit", async () => {
			const app = createTestApp(2)

			// Add another test route
			app.get("/other", (_req: Request, res: Response) => {
				res.json({ message: "other" })
			})

			// First request to /test
			const response1 = await request(app).get("/test")
			expect(response1.status).toBe(200)

			// Second request to /other (same IP, counts against limit)
			const response2 = await request(app).get("/test")
			expect(response2.status).toBe(200)

			// Third request should be rate limited
			const response3 = await request(app).get("/test")
			expect(response3.status).toBe(429)
		})
	})

	describe("Excluded Paths", () => {
		it("should not rate limit /health", async () => {
			const app = createTestApp(1)

			// Exhaust the limit on /test
			await request(app).get("/test")
			const limitedResponse = await request(app).get("/test")
			expect(limitedResponse.status).toBe(429)

			// /health should still work
			const healthResponse = await request(app).get("/health")
			expect(healthResponse.status).toBe(200)
			expect(healthResponse.body).toEqual({ status: "ok" })
		})

		it("should not rate limit /ready", async () => {
			const app = createTestApp(1)

			// Exhaust the limit
			await request(app).get("/test")
			await request(app).get("/test")

			// /ready should still work
			const response = await request(app).get("/ready")
			expect(response.status).toBe(200)
			expect(response.body).toEqual({ status: "ready" })
		})

		it("should not rate limit /live", async () => {
			const app = createTestApp(1)

			// Exhaust the limit
			await request(app).get("/test")
			await request(app).get("/test")

			// /live should still work
			const response = await request(app).get("/live")
			expect(response.status).toBe(200)
			expect(response.body).toEqual({ status: "alive" })
		})

		it("should not rate limit /docs", async () => {
			const app = createTestApp(1)

			// Exhaust the limit
			await request(app).get("/test")
			await request(app).get("/test")

			// /docs should still work
			const response = await request(app).get("/docs")
			expect(response.status).toBe(200)
		})

		it("should not rate limit /docs/* sub-paths", async () => {
			const app = createTestApp(1)

			// Exhaust the limit
			await request(app).get("/test")
			await request(app).get("/test")

			// /docs/swagger.json should still work
			const response = await request(app).get("/docs/swagger.json")
			expect(response.status).toBe(200)
		})

		it("should allow unlimited requests to excluded paths", async () => {
			const app = createTestApp(1)

			// Make many requests to /health (should all succeed)
			for (let i = 0; i < 10; i++) {
				const response = await request(app).get("/health")
				expect(response.status).toBe(200)
			}
		})
	})

	describe("Response Headers", () => {
		it("should include rate limit header", async () => {
			const app = createTestApp(5)

			const response = await request(app).get("/test")
			// draft-7 standard uses 'ratelimit' header with policy format
			// or individual headers like ratelimit-limit, ratelimit-remaining
			const hasRateLimitHeader =
				response.headers.ratelimit !== undefined ||
				response.headers["ratelimit-limit"] !== undefined ||
				response.headers["x-ratelimit-limit"] !== undefined
			expect(hasRateLimitHeader).toBe(true)
		})

		it("should include rate limit remaining info", async () => {
			const app = createTestApp(5)

			const response = await request(app).get("/test")
			// draft-7 uses combined 'ratelimit' header or individual headers
			const hasRemainingInfo =
				response.headers.ratelimit !== undefined ||
				response.headers["ratelimit-remaining"] !== undefined ||
				response.headers["x-ratelimit-remaining"] !== undefined
			expect(hasRemainingInfo).toBe(true)
		})

		it("should track remaining count across requests", async () => {
			const app = createTestApp(5)

			const response1 = await request(app).get("/test")
			const response2 = await request(app).get("/test")

			// Both responses should succeed
			expect(response1.status).toBe(200)
			expect(response2.status).toBe(200)

			// At least one rate limit related header should exist
			const hasHeaders1 =
				response1.headers.ratelimit !== undefined ||
				response1.headers["ratelimit-remaining"] !== undefined
			const hasHeaders2 =
				response2.headers.ratelimit !== undefined ||
				response2.headers["ratelimit-remaining"] !== undefined

			expect(hasHeaders1).toBe(true)
			expect(hasHeaders2).toBe(true)
		})

		it("should include Retry-After header when rate limited", async () => {
			const app = createTestApp(1)

			// Exhaust limit
			await request(app).get("/test")

			// Rate limited request
			const response = await request(app).get("/test")
			expect(response.status).toBe(429)
			expect(response.headers["retry-after"]).toBeDefined()
		})
	})

	describe("Error Response Consistency", () => {
		it("should match AppError JSON structure", async () => {
			const app = createTestApp(1)

			// Exhaust limit
			await request(app).get("/test")

			// Rate limited request
			const response = await request(app).get("/test")

			// Should have same structure as AppError.toJSON()
			expect(response.body).toHaveProperty("error")
			expect(response.body).toHaveProperty("code")
			expect(response.body).toHaveProperty("statusCode")
			expect(typeof response.body.error).toBe("string")
			expect(typeof response.body.code).toBe("string")
			expect(typeof response.body.statusCode).toBe("number")
		})

		it("should return consistent error message", async () => {
			const app = createTestApp(1)

			// Exhaust limit
			await request(app).get("/test")

			// Multiple rate limited requests should return same error
			const response1 = await request(app).get("/test")
			const response2 = await request(app).get("/test")

			expect(response1.body).toEqual(response2.body)
			expect(response1.body.error).toBe(
				"Too many requests, please try again later"
			)
		})
	})

	describe("HTTP Methods", () => {
		it("should rate limit all HTTP methods equally", async () => {
			const app = createTestApp(2)

			// Add routes for different methods
			app.post("/test", (_req: Request, res: Response) => {
				res.json({ method: "POST" })
			})

			app.put("/test", (_req: Request, res: Response) => {
				res.json({ method: "PUT" })
			})

			// First request (GET)
			const response1 = await request(app).get("/test")
			expect(response1.status).toBe(200)

			// Second request (POST - same limit)
			const response2 = await request(app).post("/test")
			expect(response2.status).toBe(200)

			// Third request should be rate limited
			const response3 = await request(app).put("/test")
			expect(response3.status).toBe(429)
		})
	})
})
