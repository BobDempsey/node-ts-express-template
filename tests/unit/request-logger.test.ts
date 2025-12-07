/**
 * Unit Tests for Request Logger Middleware
 *
 * Test Coverage Plan:
 * 1. Request ID Generation
 *    - Should generate unique request ID
 *    - Should add request ID to response header
 *    - Should add request ID to request object
 *
 * 2. Response Time Tracking
 *    - Should calculate response duration
 *    - Should include duration in log output
 *
 * 3. Logging Format
 *    - Should use JSON format in production
 *    - Should use human-readable format in development
 *    - Should include method, path, status code, and duration
 *    - Should include request ID
 *
 * 4. Status Code Emoji
 *    - Should use ✅ for 2xx status codes
 *    - Should use ⚠️ for 4xx status codes
 *    - Should use ❌ for 5xx status codes
 *
 * 5. Middleware Behavior
 *    - Should call next() to continue middleware chain
 *    - Should not block request processing
 */

import type { NextFunction, Request, Response } from "express"
import { requestLogger } from "@/middleware"

// Mock logger
jest.mock("@/lib/logger", () => ({
	logger: {
		info: jest.fn(),
		error: jest.fn(),
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

// Mock crypto randomUUID
jest.mock("node:crypto", () => ({
	randomUUID: jest.fn(() => "test-uuid-1234")
}))

describe("requestLogger middleware", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let mockNext: NextFunction
	let setHeaderMock: jest.Mock
	let onMock: jest.Mock
	let consoleLogSpy: jest.SpyInstance

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup console.log spy
		consoleLogSpy = jest.spyOn(console, "log").mockImplementation()

		// Setup mock request
		mockRequest = {
			method: "GET",
			originalUrl: "/test"
		}

		// Setup mock response
		setHeaderMock = jest.fn()
		onMock = jest.fn()
		mockResponse = {
			setHeader: setHeaderMock,
			on: onMock,
			statusCode: 200
		}

		// Setup mock next function
		mockNext = jest.fn()
	})

	afterEach(() => {
		consoleLogSpy.mockRestore()
	})

	describe("Request ID Generation", () => {
		it("should generate unique request ID", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(setHeaderMock).toHaveBeenCalledWith(
				"X-Request-Id",
				"test-uuid-1234"
			)
		})

		it("should add request ID to response header", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(setHeaderMock).toHaveBeenCalledWith(
				"X-Request-Id",
				"test-uuid-1234"
			)
		})

		it("should add request ID to request object", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect((mockRequest as Request & { id: string }).id).toBe(
				"test-uuid-1234"
			)
		})
	})

	describe("Middleware Behavior", () => {
		it("should call next() to continue middleware chain", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(mockNext).toHaveBeenCalled()
		})

		it("should register finish event listener", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(onMock).toHaveBeenCalledWith("finish", expect.any(Function))
		})
	})

	describe("Logging Format - Development", () => {
		beforeEach(() => {
			;(env as any).NODE_ENV = "development"
		})

		it("should use human-readable format in development", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			// Trigger the finish event
			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(logger.info).toHaveBeenCalled()
			expect(consoleLogSpy).not.toHaveBeenCalled()
		})

		it("should include method, path, status code, and duration", () => {
			mockRequest.method = "POST"
			mockRequest.originalUrl = "/api/users"
			mockResponse.statusCode = 201

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("POST")
			expect(logCall).toContain("/api/users")
			expect(logCall).toContain("201")
			expect(logCall).toMatch(/\d+ms/)
			expect(logCall).toContain("[test-uuid-1234]")
		})

		it("should use ✅ emoji for 2xx status codes", () => {
			mockResponse.statusCode = 200

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("✅")
		})

		it("should use ⚠️ emoji for 4xx status codes", () => {
			mockResponse.statusCode = 404

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("⚠️")
		})

		it("should use ❌ emoji for 5xx status codes", () => {
			mockResponse.statusCode = 500

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("❌")
		})
	})

	describe("Logging Format - Production", () => {
		beforeEach(() => {
			;(env as any).NODE_ENV = "production"
		})

		it("should use JSON format in production", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(consoleLogSpy).toHaveBeenCalled()
			expect(logger.info).not.toHaveBeenCalled()

			const loggedData = consoleLogSpy.mock.calls[0][0]
			const parsed = JSON.parse(loggedData)

			expect(parsed).toHaveProperty("requestId", "test-uuid-1234")
			expect(parsed).toHaveProperty("method", "GET")
			expect(parsed).toHaveProperty("path", "/test")
			expect(parsed).toHaveProperty("statusCode", 200)
			expect(parsed).toHaveProperty("duration")
			expect(parsed).toHaveProperty("timestamp")
		})

		it("should include all required fields in JSON format", () => {
			mockRequest.method = "PUT"
			mockRequest.originalUrl = "/api/items/123"
			mockResponse.statusCode = 204

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const loggedData = consoleLogSpy.mock.calls[0][0]
			const parsed = JSON.parse(loggedData)

			expect(parsed.method).toBe("PUT")
			expect(parsed.path).toBe("/api/items/123")
			expect(parsed.statusCode).toBe(204)
			expect(typeof parsed.duration).toBe("number")
			expect(typeof parsed.timestamp).toBe("string")
		})

		it("should have valid ISO timestamp in JSON format", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const loggedData = consoleLogSpy.mock.calls[0][0]
			const parsed = JSON.parse(loggedData)

			// Verify it's a valid ISO timestamp
			const timestamp = new Date(parsed.timestamp)
			expect(timestamp.toISOString()).toBe(parsed.timestamp)
		})
	})

	describe("Response Time Tracking", () => {
		beforeEach(() => {
			;(env as any).NODE_ENV = "development"
		})

		it("should calculate response duration", () => {
			const originalDateNow = Date.now
			let currentTime = 1000

			Date.now = jest.fn(() => currentTime)

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			// Simulate 50ms delay
			currentTime = 1050

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("50ms")

			Date.now = originalDateNow
		})

		it("should track different durations accurately", () => {
			const originalDateNow = Date.now
			let currentTime = 2000

			Date.now = jest.fn(() => currentTime)

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			// Simulate 123ms delay
			currentTime = 2123

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("123ms")

			Date.now = originalDateNow
		})
	})

	describe("Edge Cases", () => {
		beforeEach(() => {
			;(env as any).NODE_ENV = "development"
		})

		it("should handle requests with query parameters", () => {
			mockRequest.originalUrl = "/api/search?q=test&page=1"

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("/api/search?q=test&page=1")
		})

		it("should handle empty path", () => {
			mockRequest.originalUrl = "/"

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = (logger.info as jest.Mock).mock.calls[0][0]
			expect(logCall).toContain("/")
		})

		it("should handle different HTTP methods", () => {
			const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

			for (const method of methods) {
				jest.clearAllMocks()
				mockRequest.method = method

				requestLogger(
					mockRequest as Request,
					mockResponse as Response,
					mockNext
				)

				const finishCallback = onMock.mock.calls[0][1]
				finishCallback()

				const logCall = (logger.info as jest.Mock).mock.calls[0][0]
				expect(logCall).toContain(method)
			}
		})
	})
})
