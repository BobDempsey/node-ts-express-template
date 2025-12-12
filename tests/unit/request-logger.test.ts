/**
 * Unit Tests for Request Logger Middleware (Pino-based)
 *
 * Test Coverage Plan:
 * 1. Request ID Generation
 *    - Should generate unique request ID
 *    - Should add request ID to response header
 *    - Should add request ID to request object
 *
 * 2. Child Logger Creation
 *    - Should create child logger with requestId binding
 *    - Should attach child logger to request object
 *
 * 3. Response Time Tracking
 *    - Should calculate response duration
 *    - Should include duration in structured log
 *
 * 4. Structured Logging
 *    - Should log with structured metadata (method, path, statusCode, duration)
 *    - Should include userAgent and IP in logs
 *
 * 5. Middleware Behavior
 *    - Should call next() to continue middleware chain
 *    - Should not block request processing
 */

import type { NextFunction, Request, Response } from "express"
import { requestLogger } from "@/middleware"

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

// Mock crypto randomUUID
jest.mock("node:crypto", () => ({
	randomUUID: jest.fn(() => "test-uuid-1234")
}))

import { createChildLogger } from "@/lib/logger"

describe("requestLogger middleware", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let mockNext: NextFunction
	let setHeaderMock: jest.Mock
	let onMock: jest.Mock

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup mock request
		mockRequest = {
			method: "GET",
			originalUrl: "/test",
			get: jest.fn().mockReturnValue("test-user-agent"),
			ip: "127.0.0.1"
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

	describe("Child Logger Creation", () => {
		it("should create child logger with requestId binding", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(createChildLogger).toHaveBeenCalledWith({
				requestId: "test-uuid-1234"
			})
		})

		it("should attach child logger to request object", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			expect(
				(mockRequest as Request & { log: typeof mockChildLogger }).log
			).toBe(mockChildLogger)
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

	describe("Structured Logging", () => {
		it("should log with structured metadata on finish", () => {
			mockRequest.method = "POST"
			mockRequest.originalUrl = "/api/users"
			mockResponse.statusCode = 201

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			// Trigger the finish event
			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/api/users",
					statusCode: 201,
					duration: expect.any(Number),
					userAgent: "test-user-agent",
					ip: "127.0.0.1"
				}),
				expect.stringContaining("POST /api/users 201")
			)
		})

		it("should include duration in structured log", () => {
			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			const logCall = mockChildLoggerInfo.mock.calls[0]
			expect(logCall[0]).toHaveProperty("duration")
			expect(typeof logCall[0].duration).toBe("number")
		})

		it("should include userAgent in logs", () => {
			mockRequest.get = jest.fn().mockReturnValue("Mozilla/5.0")

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].userAgent).toBe("Mozilla/5.0")
		})

		it("should include IP address in logs", () => {
			;(mockRequest as { ip: string }).ip = "192.168.1.1"

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].ip).toBe("192.168.1.1")
		})
	})

	describe("Response Time Tracking", () => {
		it("should calculate response duration", () => {
			const originalDateNow = Date.now
			let currentTime = 1000

			Date.now = jest.fn(() => currentTime)

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			// Simulate 50ms delay
			currentTime = 1050

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].duration).toBe(50)

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

			expect(mockChildLoggerInfo.mock.calls[0][0].duration).toBe(123)

			Date.now = originalDateNow
		})
	})

	describe("Edge Cases", () => {
		it("should handle requests with query parameters", () => {
			mockRequest.originalUrl = "/api/search?q=test&page=1"

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].path).toBe(
				"/api/search?q=test&page=1"
			)
		})

		it("should handle empty path", () => {
			mockRequest.originalUrl = "/"

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].path).toBe("/")
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

				expect(mockChildLoggerInfo.mock.calls[0][0].method).toBe(method)
			}
		})

		it("should handle different status codes", () => {
			const statusCodes = [200, 201, 301, 400, 404, 500, 503]

			for (const statusCode of statusCodes) {
				jest.clearAllMocks()
				mockResponse.statusCode = statusCode

				requestLogger(
					mockRequest as Request,
					mockResponse as Response,
					mockNext
				)

				const finishCallback = onMock.mock.calls[0][1]
				finishCallback()

				expect(mockChildLoggerInfo.mock.calls[0][0].statusCode).toBe(statusCode)
			}
		})

		it("should handle undefined userAgent", () => {
			mockRequest.get = jest.fn().mockReturnValue(undefined)

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].userAgent).toBeUndefined()
		})

		it("should handle undefined IP", () => {
			;(mockRequest as { ip: string | undefined }).ip = undefined

			requestLogger(mockRequest as Request, mockResponse as Response, mockNext)

			const finishCallback = onMock.mock.calls[0][1]
			finishCallback()

			expect(mockChildLoggerInfo.mock.calls[0][0].ip).toBeUndefined()
		})
	})
})
