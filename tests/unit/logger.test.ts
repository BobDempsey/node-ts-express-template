/**
 * Unit Tests for logger.ts (Pino-based)
 *
 * Test Coverage Plan:
 * 1. Logger Instance
 *    - Should export a valid pino logger instance
 *    - Should have standard log methods (info, warn, error, debug)
 *
 * 2. Convenience Functions
 *    - info() should log info messages
 *    - warn() should log warn messages
 *    - error() should log error messages
 *    - debug() should log debug messages
 *    - Should support optional object parameter for structured data
 *
 * 3. Child Logger Creation
 *    - createChildLogger() should create a child logger with bindings
 *    - Child logger should inherit parent configuration
 *
 * 4. LogLevel Type
 *    - Should export LogLevel type with valid values
 *
 * Note: In test environment, logger is set to "silent" level,
 * so we test the function signatures and logger structure rather than output.
 */

import type { Logger } from "pino"
import {
	createChildLogger,
	debug,
	error,
	info,
	type LogLevel,
	logger,
	warn
} from "@/lib/logger"

describe("logger.ts (Pino)", () => {
	describe("Logger Instance", () => {
		it("should export a valid pino logger instance", () => {
			expect(logger).toBeDefined()
			expect(typeof logger.info).toBe("function")
			expect(typeof logger.warn).toBe("function")
			expect(typeof logger.error).toBe("function")
			expect(typeof logger.debug).toBe("function")
			expect(typeof logger.fatal).toBe("function")
			expect(typeof logger.trace).toBe("function")
		})

		it("should have child method for creating child loggers", () => {
			expect(typeof logger.child).toBe("function")
		})

		it("should have level property", () => {
			expect(logger.level).toBeDefined()
			expect(typeof logger.level).toBe("string")
		})
	})

	describe("Convenience Functions", () => {
		describe("info()", () => {
			it("should be a function", () => {
				expect(typeof info).toBe("function")
			})

			it("should accept a string message", () => {
				// Should not throw
				expect(() => info("test message")).not.toThrow()
			})

			it("should accept a string message with object", () => {
				// Should not throw
				expect(() => info("test message", { key: "value" })).not.toThrow()
			})
		})

		describe("warn()", () => {
			it("should be a function", () => {
				expect(typeof warn).toBe("function")
			})

			it("should accept a string message", () => {
				expect(() => warn("test warning")).not.toThrow()
			})

			it("should accept a string message with object", () => {
				expect(() => warn("test warning", { warning: true })).not.toThrow()
			})
		})

		describe("error()", () => {
			it("should be a function", () => {
				expect(typeof error).toBe("function")
			})

			it("should accept a string message", () => {
				expect(() => error("test error")).not.toThrow()
			})

			it("should accept a string message with object", () => {
				expect(() => error("test error", { errorCode: "ERR001" })).not.toThrow()
			})
		})

		describe("debug()", () => {
			it("should be a function", () => {
				expect(typeof debug).toBe("function")
			})

			it("should accept a string message", () => {
				expect(() => debug("test debug")).not.toThrow()
			})

			it("should accept a string message with object", () => {
				expect(() => debug("test debug", { debugData: 123 })).not.toThrow()
			})
		})
	})

	describe("createChildLogger()", () => {
		it("should be a function", () => {
			expect(typeof createChildLogger).toBe("function")
		})

		it("should create a child logger with bindings", () => {
			const childLogger = createChildLogger({ requestId: "test-123" })

			expect(childLogger).toBeDefined()
			expect(typeof childLogger.info).toBe("function")
			expect(typeof childLogger.warn).toBe("function")
			expect(typeof childLogger.error).toBe("function")
			expect(typeof childLogger.debug).toBe("function")
		})

		it("should create child logger with multiple bindings", () => {
			const childLogger = createChildLogger({
				requestId: "test-456",
				userId: "user-789",
				operation: "create"
			})

			expect(childLogger).toBeDefined()
			// Should not throw when logging
			expect(() => childLogger.info("test message")).not.toThrow()
		})

		it("should return a valid pino Logger", () => {
			const childLogger: Logger = createChildLogger({ test: true })
			expect(childLogger.child).toBeDefined()
		})
	})

	describe("LogLevel Type", () => {
		it("should define valid log levels", () => {
			const validLevels: LogLevel[] = [
				"trace",
				"debug",
				"info",
				"warn",
				"error",
				"fatal"
			]

			expect(validLevels).toHaveLength(6)

			// Verify each level is a valid string
			validLevels.forEach((level) => {
				expect(typeof level).toBe("string")
			})
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty string messages", () => {
			expect(() => info("")).not.toThrow()
			expect(() => warn("")).not.toThrow()
			expect(() => error("")).not.toThrow()
			expect(() => debug("")).not.toThrow()
		})

		it("should handle messages with special characters", () => {
			const specialMessage = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
			expect(() => info(specialMessage)).not.toThrow()
		})

		it("should handle messages with unicode and emoji", () => {
			const unicodeMessage = "Hello 你好 مرحبا שלום"
			expect(() => info(unicodeMessage)).not.toThrow()
		})

		it("should handle complex objects in structured data", () => {
			const complexObject = {
				nested: {
					deep: {
						value: "test"
					}
				},
				array: [1, 2, 3],
				date: new Date().toISOString()
			}
			expect(() => info("complex data", complexObject)).not.toThrow()
		})

		it("should handle undefined in object parameter", () => {
			expect(() => info("test", undefined)).not.toThrow()
		})
	})
})
