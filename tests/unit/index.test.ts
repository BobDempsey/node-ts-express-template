import type { Server } from "http"
import request from "supertest"
import { GREETING } from "@/lib/constants"

// Create mock functions
const mockLoggerInfo = jest.fn()
const mockLoggerWarn = jest.fn()
const mockLoggerError = jest.fn()
const mockLoggerDebug = jest.fn()

// Mock child logger for request-logger middleware
const mockChildLoggerInfo = jest.fn()
const mockChildLogger = {
	info: mockChildLoggerInfo,
	error: jest.fn(),
	warn: jest.fn(),
	debug: jest.fn()
}

// Mock the logger before importing index
jest.mock("@/lib/logger", () => ({
	logger: {
		info: mockLoggerInfo,
		warn: mockLoggerWarn,
		error: mockLoggerError,
		debug: mockLoggerDebug
	},
	createChildLogger: jest.fn(() => mockChildLogger)
}))

// Mock the rate-limiter to avoid express-rate-limit validation issues in tests
jest.mock("@/middleware/rate-limiter", () => ({
	rateLimiter: (_req: unknown, _res: unknown, next: () => void) => next()
}))

describe("index.ts - Server Instance", () => {
	let server: Server
	let cleanup: (() => void) | undefined
	const originalEnv = process.env

	beforeEach(() => {
		// Reset environment variables
		process.env = { ...originalEnv }
		// Clear mock calls
		mockLoggerInfo.mockClear()
		mockLoggerWarn.mockClear()
		mockLoggerError.mockClear()
		mockLoggerDebug.mockClear()
	})

	afterEach(async () => {
		// Clean up SIGTERM listener to prevent memory leak warning
		if (cleanup) {
			cleanup()
			cleanup = undefined
		}
		// Clean up server if it's running
		if (server?.listening) {
			await new Promise<void>((resolve, reject) => {
				server.close((err) => {
					if (err) reject(err)
					else resolve()
				})
			})
		}
		// Restore environment
		process.env = originalEnv
	})

	afterAll(() => {
		// Clear module cache to allow re-importing with different env vars
		jest.resetModules()
	})

	describe("Server Initialization", () => {
		it("should export a valid HTTP server instance", async () => {
			// Import the server (this will start it)
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			expect(server).toBeDefined()
			expect(typeof server.listen).toBe("function")
			expect(typeof server.close).toBe("function")
		})

		it("should handle requests on the exported server", async () => {
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server).get("/")

			expect(response.status).toBe(200)
			expect(response.text).toBe(GREETING)
			expect(response.headers["content-type"]).toMatch(/text\/html/)
		})
	})

	describe("PORT Configuration", () => {
		it("should use PORT from environment variable", async () => {
			process.env.PORT = "4000"

			// Clear the module cache and re-import
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Wait a bit for server to start
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Check that logger was called with the correct port
			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("4000")
			)
		})

		it("should default to PORT 3000 when not specified", async () => {
			delete process.env.PORT

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("3000")
			)
		})

		it("should handle non-numeric PORT by defaulting to 3000", async () => {
			process.env.PORT = "invalid"

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("3000")
			)
		})
	})

	describe("Logger Integration", () => {
		it("should log server startup with port and environment", async () => {
			process.env.PORT = "5000"
			process.env.NODE_ENV = "test"

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("Server is running on http://localhost:5000")
			)
			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("Environment: test")
			)
		})

		it("should log development environment when NODE_ENV not set", async () => {
			delete process.env.NODE_ENV

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("Environment: development")
			)
		})
	})

	describe("Server Response Behavior", () => {
		it("should respond with GREETING constant", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server).get("/")

			expect(response.text).toBe(GREETING)
		})

		it("should set correct content-type header", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server).get("/")

			expect(response.headers["content-type"]).toMatch(/text\/html/)
		})

		it("should respond with 200 status code", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server).get("/")

			expect(response.status).toBe(200)
		})
	})

	describe("Graceful Shutdown", () => {
		it("should handle SIGTERM and close server gracefully", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Mock process.exit to prevent test from exiting
			const mockExit = jest.spyOn(process, "exit").mockImplementation()

			// Wait for server to fully start
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Emit SIGTERM signal
			process.emit("SIGTERM")

			// Wait for shutdown to complete
			await new Promise((resolve) => setTimeout(resolve, 200))

			// Verify logger was called for shutdown messages
			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("SIGTERM received, shutting down gracefully")
			)
			expect(mockLoggerInfo).toHaveBeenCalledWith(
				expect.stringContaining("Process terminated")
			)

			// Verify process.exit was called with 0
			expect(mockExit).toHaveBeenCalledWith(0)

			// Restore the mock
			mockExit.mockRestore()

			// Server should be closed, so set to null to prevent afterEach cleanup
			server = null as unknown as Server
		})
	})

	describe("CORS Configuration", () => {
		it("should include CORS headers in responses", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server)
				.get("/")
				.set("Origin", "http://example.com")

			expect(response.headers["access-control-allow-origin"]).toBeDefined()
		})

		it("should handle preflight OPTIONS requests", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server)
				.options("/")
				.set("Origin", "http://example.com")
				.set("Access-Control-Request-Method", "POST")

			expect(response.status).toBe(204)
			expect(response.headers["access-control-allow-methods"]).toContain("POST")
		})

		it("should allow credentials in CORS requests", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server)
				.get("/")
				.set("Origin", "http://example.com")

			expect(response.headers["access-control-allow-credentials"]).toBe("true")
		})

		it("should respect CORS_ORIGIN environment variable", async () => {
			process.env.CORS_ORIGIN = "http://trusted-origin.com"

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server)
				.get("/")
				.set("Origin", "http://trusted-origin.com")

			expect(response.headers["access-control-allow-origin"]).toBe(
				"http://trusted-origin.com"
			)
		})

		it("should support multiple CORS origins from environment", async () => {
			process.env.CORS_ORIGIN =
				"http://origin1.com,http://origin2.com,http://origin3.com"

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Test first origin
			const response1 = await request(server)
				.get("/")
				.set("Origin", "http://origin1.com")

			expect(response1.headers["access-control-allow-origin"]).toBe(
				"http://origin1.com"
			)

			// Test second origin
			const response2 = await request(server)
				.get("/")
				.set("Origin", "http://origin2.com")

			expect(response2.headers["access-control-allow-origin"]).toBe(
				"http://origin2.com"
			)
		})

		it("should expose specified headers", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			const response = await request(server)
				.options("/")
				.set("Origin", "http://example.com")
				.set("Access-Control-Request-Method", "GET")

			expect(response.headers["access-control-expose-headers"]).toContain(
				"Content-Length"
			)
			expect(response.headers["access-control-expose-headers"]).toContain(
				"X-Request-Id"
			)
		})
	})

	describe("Error Handling", () => {
		it("should have error event listener registered", async () => {
			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Check that error handler is registered
			const errorListeners = server.listeners("error")
			expect(errorListeners.length).toBeGreaterThan(0)
		})

		it("should handle EADDRINUSE error when port is already in use", async () => {
			const mockExit = jest.spyOn(process, "exit").mockImplementation()

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Wait for server to start
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Create EADDRINUSE error
			const error = new Error("Port in use") as NodeJS.ErrnoException
			error.code = "EADDRINUSE"

			// Emit error event
			server.emit("error", error)

			// Wait for error handler to process
			await new Promise((resolve) => setTimeout(resolve, 50))

			// Logger now uses structured format: logger.error({ port, err }, message)
			expect(mockLoggerError).toHaveBeenCalledWith(
				expect.objectContaining({ err: error }),
				expect.stringContaining("already in use")
			)
			expect(mockExit).toHaveBeenCalledWith(1)

			mockExit.mockRestore()
		})

		it("should handle generic server errors", async () => {
			const mockExit = jest.spyOn(process, "exit").mockImplementation()

			jest.resetModules()
			const indexModule = await import("@/index")
			server = indexModule.default
			cleanup = indexModule.cleanup

			// Wait for server to start
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Create generic error
			const error = new Error("Some server error") as NodeJS.ErrnoException

			// Emit error event
			server.emit("error", error)

			// Wait for error handler to process
			await new Promise((resolve) => setTimeout(resolve, 50))

			// Logger now uses structured format: logger.error({ err }, message)
			expect(mockLoggerError).toHaveBeenCalledWith(
				expect.objectContaining({ err: error }),
				expect.stringContaining("Server error: Some server error")
			)
			expect(mockExit).toHaveBeenCalledWith(1)

			mockExit.mockRestore()
		})
	})
})
