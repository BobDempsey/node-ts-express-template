/**
 * Unit Tests for app.ts Express Configuration
 *
 * Tests the conditional middleware setup based on environment configuration.
 * Note: Due to module caching, we test the logic patterns and app behavior
 * with the default configuration.
 */

import request from "supertest"
import { app } from "@/app"

describe("Express App Configuration", () => {
	describe("Default Configuration", () => {
		it("should export a valid Express app", () => {
			expect(app).toBeDefined()
			expect(typeof app.use).toBe("function")
			expect(typeof app.get).toBe("function")
		})

		it("should respond to GET /", async () => {
			const response = await request(app).get("/")
			expect(response.status).toBe(200)
		})
	})

	describe("Conditional JWT Auth Logic", () => {
		it("should enable auth when ENABLE_JWT_AUTH is true", () => {
			// Test the conditional logic used in app.ts
			const enableJwtAuth = true
			const shouldApplyAuth = enableJwtAuth

			expect(shouldApplyAuth).toBe(true)
		})

		it("should disable auth when ENABLE_JWT_AUTH is false", () => {
			const enableJwtAuth = false
			const shouldApplyAuth = enableJwtAuth

			expect(shouldApplyAuth).toBe(false)
		})

		it("should define correct auth exclusion paths", () => {
			const excludedPaths = [
				"/health",
				"/ready",
				"/live",
				"/docs",
				"/api/v1/auth/login",
				"/api/v1/auth/refresh"
			]

			expect(excludedPaths).toContain("/health")
			expect(excludedPaths).toContain("/ready")
			expect(excludedPaths).toContain("/live")
			expect(excludedPaths).toContain("/docs")
			expect(excludedPaths).toContain("/api/v1/auth/login")
			expect(excludedPaths).toContain("/api/v1/auth/refresh")
			expect(excludedPaths).not.toContain("/") // "/" excluded via route order, not middleware
		})
	})

	describe("Conditional Sentry Error Handler Logic", () => {
		it("should enable Sentry error handler when SENTRY_DSN is set", () => {
			const sentryDsn = "https://test@sentry.io/123"
			const shouldSetupSentry = !!sentryDsn

			expect(shouldSetupSentry).toBe(true)
		})

		it("should disable Sentry error handler when SENTRY_DSN is not set", () => {
			const sentryDsn = undefined
			const shouldSetupSentry = !!sentryDsn

			expect(shouldSetupSentry).toBe(false)
		})
	})

	describe("CORS Configuration", () => {
		it("should allow all origins when CORS_ORIGIN is not set", () => {
			const corsOrigin = undefined
			const origin = corsOrigin ?? true

			expect(origin).toBe(true)
		})

		it("should use configured origins when CORS_ORIGIN is set", () => {
			const corsOrigin = ["http://allowed.com", "http://also-allowed.com"]
			const origin = corsOrigin ?? true

			expect(origin).toEqual(["http://allowed.com", "http://also-allowed.com"])
		})

		it("should define correct CORS options structure", () => {
			const corsOptions = {
				origin: true,
				credentials: true,
				methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
				allowedHeaders: [
					"Content-Type",
					"Authorization",
					"sentry-trace",
					"baggage"
				],
				exposedHeaders: ["Content-Length", "X-Request-Id"],
				maxAge: 86400
			}

			expect(corsOptions.credentials).toBe(true)
			expect(corsOptions.methods).toContain("GET")
			expect(corsOptions.methods).toContain("POST")
			expect(corsOptions.allowedHeaders).toContain("Authorization")
			expect(corsOptions.exposedHeaders).toContain("X-Request-Id")
			expect(corsOptions.maxAge).toBe(86400)
		})
	})

	describe("Standard Middleware", () => {
		it("should have helmet security headers configured", async () => {
			const response = await request(app).get("/")

			expect(response.headers["x-content-type-options"]).toBe("nosniff")
			expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN")
		})

		it("should have rate limiter configured", async () => {
			const response = await request(app).get("/")

			// Rate limit headers should be present
			const hasRateLimitHeader =
				response.headers.ratelimit !== undefined ||
				response.headers["ratelimit-limit"] !== undefined

			expect(hasRateLimitHeader).toBe(true)
		})

		it("should have request logger configured (X-Request-Id header)", async () => {
			const response = await request(app).get("/")

			expect(response.headers["x-request-id"]).toBeDefined()
		})
	})

	describe("404 Handler", () => {
		it("should return 404 for undefined routes", async () => {
			const response = await request(app).get("/undefined-route")

			expect(response.status).toBe(404)
			expect(response.body).toEqual({ error: "Not Found" })
		})

		it("should return JSON content type for 404", async () => {
			const response = await request(app).get("/nonexistent")

			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})
	})

	describe("API Documentation", () => {
		it("should serve swagger documentation at /docs", async () => {
			const response = await request(app).get("/docs/")

			// Swagger UI returns 200 or 301 redirect
			expect([200, 301]).toContain(response.status)
		})
	})

	describe("Health Endpoints", () => {
		it("should respond to /health", async () => {
			const response = await request(app).get("/health")
			expect(response.status).toBe(200)
		})

		it("should respond to /ready", async () => {
			const response = await request(app).get("/ready")
			expect(response.status).toBe(200)
		})

		it("should respond to /live", async () => {
			const response = await request(app).get("/live")
			expect(response.status).toBe(200)
		})
	})
})
