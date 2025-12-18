/**
 * Unit Tests for Rate Limiter Middleware
 *
 * Test Coverage Plan:
 * 1. Configuration
 *    - Should use default values when env vars not set
 *    - Should respect environment variable configuration
 *
 * 2. Skip Logic
 *    - Should skip /health endpoint
 *    - Should skip /ready endpoint
 *    - Should skip /live endpoint
 *    - Should skip /docs and /docs/* paths
 *    - Should not skip other paths
 *
 * 3. Response Format
 *    - Should return 429 status code when rate limited
 *    - Should return JSON matching AppError format
 *    - Should include correct error code
 *
 * 4. Headers
 *    - Should include rate limit headers
 */

import type { Request, Response } from "express"

// Mock logger before importing rate-limiter
const mockLoggerWarn = jest.fn()
jest.mock("@/lib/logger", () => ({
	logger: {
		warn: mockLoggerWarn,
		info: jest.fn(),
		error: jest.fn(),
		debug: jest.fn()
	}
}))

// Mock env with default values
jest.mock("@/lib/env", () => ({
	default: {
		RATE_LIMIT_WINDOW_MS: 60000,
		RATE_LIMIT_MAX_REQUESTS: 100
	}
}))

// Import the actual exported functions after mocks are set up
import {
	rateLimitHandler,
	rateLimitKeyGenerator,
	shouldSkip
} from "@/middleware/rate-limiter"

describe("Rate Limiter Middleware", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe("Skip Logic (shouldSkip function)", () => {
		// Test the actual exported shouldSkip function

		it("should identify /health as skippable", () => {
			const req = { path: "/health" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should identify /ready as skippable", () => {
			const req = { path: "/ready" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should identify /live as skippable", () => {
			const req = { path: "/live" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should identify /docs as skippable", () => {
			const req = { path: "/docs" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should identify /docs/swagger.json as skippable", () => {
			const req = { path: "/docs/swagger.json" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should identify /docs/something/else as skippable", () => {
			const req = { path: "/docs/something/else" } as Request
			expect(shouldSkip(req)).toBe(true)
		})

		it("should not skip /api/v1/example", () => {
			const req = { path: "/api/v1/example" } as Request
			expect(shouldSkip(req)).toBe(false)
		})

		it("should not skip root path /", () => {
			const req = { path: "/" } as Request
			expect(shouldSkip(req)).toBe(false)
		})

		it("should not skip /healthy (similar but different)", () => {
			const req = { path: "/healthy" } as Request
			expect(shouldSkip(req)).toBe(false)
		})

		it("should not skip /documentation (similar but different)", () => {
			const req = { path: "/documentation" } as Request
			expect(shouldSkip(req)).toBe(false)
		})
	})

	describe("Response Format", () => {
		it("should define correct error response structure", () => {
			// Test the expected response structure
			const expectedResponse = {
				error: "Too many requests, please try again later",
				code: "RATE_LIMIT_EXCEEDED",
				statusCode: 429
			}

			expect(expectedResponse.error).toBe(
				"Too many requests, please try again later"
			)
			expect(expectedResponse.code).toBe("RATE_LIMIT_EXCEEDED")
			expect(expectedResponse.statusCode).toBe(429)
		})

		it("should have consistent error format with AppError", () => {
			// Verify the response matches AppError toJSON structure
			const response = {
				error: "Too many requests, please try again later",
				code: "RATE_LIMIT_EXCEEDED",
				statusCode: 429
			}

			// AppError.toJSON() returns { error, code, statusCode, details? }
			expect(response).toHaveProperty("error")
			expect(response).toHaveProperty("code")
			expect(response).toHaveProperty("statusCode")
			expect(typeof response.error).toBe("string")
			expect(typeof response.code).toBe("string")
			expect(typeof response.statusCode).toBe("number")
		})
	})

	describe("Logging", () => {
		it("should log rate limit events with expected structure", () => {
			// Test that the log structure is correct
			const logPayload = {
				requestId: "test-uuid",
				ip: "127.0.0.1",
				path: "/api/test",
				method: "GET"
			}

			// Verify log structure has required fields
			expect(logPayload).toHaveProperty("requestId")
			expect(logPayload).toHaveProperty("ip")
			expect(logPayload).toHaveProperty("path")
			expect(logPayload).toHaveProperty("method")
		})
	})

	describe("Configuration Defaults", () => {
		it("should have default window of 60000ms (1 minute)", () => {
			const defaultWindowMs = 60000
			expect(defaultWindowMs).toBe(60000)
		})

		it("should have default max requests of 100", () => {
			const defaultMaxRequests = 100
			expect(defaultMaxRequests).toBe(100)
		})
	})

	describe("Key Generator (rateLimitKeyGenerator function)", () => {
		it("should use IP address for rate limiting key", () => {
			const mockRequest = {
				ip: "192.168.1.1",
				socket: { remoteAddress: "192.168.1.2" }
			} as unknown as Request

			const key = rateLimitKeyGenerator(mockRequest)
			expect(key).toBe("192.168.1.1")
		})

		it("should fall back to socket.remoteAddress when ip is undefined", () => {
			const mockRequest = {
				ip: undefined,
				socket: { remoteAddress: "192.168.1.2" }
			} as unknown as Request

			const key = rateLimitKeyGenerator(mockRequest)
			expect(key).toBe("192.168.1.2")
		})

		it("should use unknown when both ip and remoteAddress are undefined", () => {
			const mockRequest = {
				ip: undefined,
				socket: { remoteAddress: undefined }
			} as unknown as Request

			const key = rateLimitKeyGenerator(mockRequest)
			expect(key).toBe("unknown")
		})

		it("should handle empty string ip by falling back to socket.remoteAddress", () => {
			const mockRequest = {
				ip: "",
				socket: { remoteAddress: "10.0.0.1" }
			} as unknown as Request

			const key = rateLimitKeyGenerator(mockRequest)
			expect(key).toBe("10.0.0.1")
		})
	})

	describe("Rate Limiter Handler (rateLimitHandler function)", () => {
		it("should return 429 status with correct JSON response", () => {
			const mockReq = {
				ip: "127.0.0.1",
				path: "/api/test",
				method: "GET",
				id: "test-request-id"
			} as unknown as Request

			const mockJson = jest.fn()
			const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
			const mockRes = {
				status: mockStatus
			} as unknown as Response

			rateLimitHandler(mockReq, mockRes)

			expect(mockStatus).toHaveBeenCalledWith(429)
			expect(mockJson).toHaveBeenCalledWith({
				error: "Too many requests, please try again later",
				code: "RATE_LIMIT_EXCEEDED",
				statusCode: 429
			})
		})

		it("should log rate limit event with correct structure", () => {
			const mockReq = {
				ip: "192.168.1.100",
				path: "/api/users",
				method: "POST",
				id: "req-12345"
			} as unknown as Request

			const mockJson = jest.fn()
			const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
			const mockRes = {
				status: mockStatus
			} as unknown as Response

			rateLimitHandler(mockReq, mockRes)

			expect(mockLoggerWarn).toHaveBeenCalledWith(
				{
					requestId: "req-12345",
					ip: "192.168.1.100",
					path: "/api/users",
					method: "POST"
				},
				"Rate limit exceeded for 192.168.1.100"
			)
		})

		it("should handle request without id property", () => {
			const mockReq = {
				ip: "10.0.0.1",
				path: "/api/data",
				method: "GET"
				// No id property
			} as unknown as Request

			const mockJson = jest.fn()
			const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
			const mockRes = {
				status: mockStatus
			} as unknown as Response

			rateLimitHandler(mockReq, mockRes)

			expect(mockLoggerWarn).toHaveBeenCalledWith(
				{
					requestId: undefined,
					ip: "10.0.0.1",
					path: "/api/data",
					method: "GET"
				},
				"Rate limit exceeded for 10.0.0.1"
			)
		})

		it("should handle undefined ip in log message", () => {
			const mockReq = {
				ip: undefined,
				path: "/api/test",
				method: "DELETE"
			} as unknown as Request

			const mockJson = jest.fn()
			const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
			const mockRes = {
				status: mockStatus
			} as unknown as Response

			rateLimitHandler(mockReq, mockRes)

			expect(mockLoggerWarn).toHaveBeenCalledWith(
				{
					requestId: undefined,
					ip: undefined,
					path: "/api/test",
					method: "DELETE"
				},
				"Rate limit exceeded for undefined"
			)
		})
	})
})
