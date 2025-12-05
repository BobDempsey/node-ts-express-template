/**
 * Unit Tests for logger.ts
 *
 * Test Coverage Plan:
 * 1. Message Formatting
 *    - Verify correct timestamp format (ISO 8601)
 *    - Verify log level is uppercase in output
 *    - Verify message is included in output
 *    - Verify complete format: [timestamp] [LEVEL] message
 *
 * 2. Individual Logger Functions
 *    - info() should call console.info with formatted message
 *    - warn() should call console.warn with formatted message
 *    - error() should call console.error with formatted message
 *    - debug() should call console.debug with formatted message
 *
 * 3. Logger Object
 *    - Should export all four methods (info, warn, error, debug)
 *    - logger.info() should behave same as info()
 *    - logger.warn() should behave same as warn()
 *    - logger.error() should behave same as error()
 *    - logger.debug() should behave same as debug()
 *
 * 4. Edge Cases
 *    - Empty string messages
 *    - Messages with special characters
 *    - Messages with newlines
 *    - Very long messages
 *    - Unicode/emoji in messages
 *
 * 5. Type Safety
 *    - LogLevel type should only accept valid log levels
 *    - Functions should accept string messages
 */

import { debug, error, info, type LogLevel, logger, warn } from "@/lib/logger"

describe("logger.ts", () => {
	// Store original console methods
	let consoleInfoSpy: jest.SpyInstance
	let consoleWarnSpy: jest.SpyInstance
	let consoleErrorSpy: jest.SpyInstance
	let consoleDebugSpy: jest.SpyInstance

	beforeEach(() => {
		// Mock console methods before each test
		consoleInfoSpy = jest.spyOn(console, "info").mockImplementation()
		consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
		consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()
		consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation()
	})

	afterEach(() => {
		// Restore console methods after each test
		jest.restoreAllMocks()
	})

	describe("Message Formatting", () => {
		it("should format message with ISO 8601 timestamp", () => {
			info("test message")
			const call = consoleInfoSpy.mock.calls[0][0]

			// Extract timestamp from format: [timestamp] [LEVEL] message
			const timestampMatch = call.match(/\[(.*?)\]/)
			expect(timestampMatch).not.toBeNull()

			const timestamp = timestampMatch[1]
			// Verify ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
			expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

			// Verify it's a valid date
			const date = new Date(timestamp)
			expect(date.toISOString()).toBe(timestamp)
		})

		it("should format message with uppercase log level", () => {
			info("test")
			expect(consoleInfoSpy.mock.calls[0][0]).toContain("[INFO]")

			warn("test")
			expect(consoleWarnSpy.mock.calls[0][0]).toContain("[WARN]")

			error("test")
			expect(consoleErrorSpy.mock.calls[0][0]).toContain("[ERROR]")

			debug("test")
			expect(consoleDebugSpy.mock.calls[0][0]).toContain("[DEBUG]")
		})

		it("should include the message in formatted output", () => {
			const testMessage = "This is a test message"
			info(testMessage)

			const output = consoleInfoSpy.mock.calls[0][0]
			expect(output).toContain(testMessage)
		})

		it("should follow format: [timestamp] [LEVEL] message", () => {
			const testMessage = "test message"
			info(testMessage)

			const output = consoleInfoSpy.mock.calls[0][0]
			// Match format: [ISO timestamp] [LEVEL] message
			const formatRegex =
				/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[(INFO|WARN|ERROR|DEBUG)\] .+$/
			expect(output).toMatch(formatRegex)
			expect(output).toContain(testMessage)
		})
	})

	describe("info()", () => {
		it("should call console.info with formatted message", () => {
			const message = "info test message"
			info(message)

			expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
			expect(consoleInfoSpy.mock.calls[0][0]).toContain(message)
		})

		it("should format message with INFO level", () => {
			info("test")
			const output = consoleInfoSpy.mock.calls[0][0]
			expect(output).toContain("[INFO]")
		})
	})

	describe("warn()", () => {
		it("should call console.warn with formatted message", () => {
			const message = "warn test message"
			warn(message)

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
			expect(consoleWarnSpy.mock.calls[0][0]).toContain(message)
		})

		it("should format message with WARN level", () => {
			warn("test")
			const output = consoleWarnSpy.mock.calls[0][0]
			expect(output).toContain("[WARN]")
		})
	})

	describe("error()", () => {
		it("should call console.error with formatted message", () => {
			const message = "error test message"
			error(message)

			expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
			expect(consoleErrorSpy.mock.calls[0][0]).toContain(message)
		})

		it("should format message with ERROR level", () => {
			error("test")
			const output = consoleErrorSpy.mock.calls[0][0]
			expect(output).toContain("[ERROR]")
		})
	})

	describe("debug()", () => {
		it("should call console.debug with formatted message", () => {
			const message = "debug test message"
			debug(message)

			expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
			expect(consoleDebugSpy.mock.calls[0][0]).toContain(message)
		})

		it("should format message with DEBUG level", () => {
			debug("test")
			const output = consoleDebugSpy.mock.calls[0][0]
			expect(output).toContain("[DEBUG]")
		})
	})

	describe("logger object", () => {
		it("should export all four logging methods", () => {
			expect(logger).toHaveProperty("info")
			expect(logger).toHaveProperty("warn")
			expect(logger).toHaveProperty("error")
			expect(logger).toHaveProperty("debug")

			expect(typeof logger.info).toBe("function")
			expect(typeof logger.warn).toBe("function")
			expect(typeof logger.error).toBe("function")
			expect(typeof logger.debug).toBe("function")
		})

		it("should have logger.info() that calls console.info", () => {
			const message = "logger.info test"
			logger.info(message)

			expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
			expect(consoleInfoSpy.mock.calls[0][0]).toContain(message)
			expect(consoleInfoSpy.mock.calls[0][0]).toContain("[INFO]")
		})

		it("should have logger.warn() that calls console.warn", () => {
			const message = "logger.warn test"
			logger.warn(message)

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
			expect(consoleWarnSpy.mock.calls[0][0]).toContain(message)
			expect(consoleWarnSpy.mock.calls[0][0]).toContain("[WARN]")
		})

		it("should have logger.error() that calls console.error", () => {
			const message = "logger.error test"
			logger.error(message)

			expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
			expect(consoleErrorSpy.mock.calls[0][0]).toContain(message)
			expect(consoleErrorSpy.mock.calls[0][0]).toContain("[ERROR]")
		})

		it("should have logger.debug() that calls console.debug", () => {
			const message = "logger.debug test"
			logger.debug(message)

			expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
			expect(consoleDebugSpy.mock.calls[0][0]).toContain(message)
			expect(consoleDebugSpy.mock.calls[0][0]).toContain("[DEBUG]")
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty string messages", () => {
			info("")

			expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
			const output = consoleInfoSpy.mock.calls[0][0]
			// Should still have timestamp and level, just no message content
			expect(output).toMatch(
				/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] $/
			)
		})

		it("should handle messages with special characters", () => {
			const specialMessage = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
			warn(specialMessage)

			const output = consoleWarnSpy.mock.calls[0][0]
			expect(output).toContain(specialMessage)
			expect(output).toContain("[WARN]")
		})

		it("should handle messages with newlines", () => {
			const multilineMessage = "Line 1\nLine 2\nLine 3"
			error(multilineMessage)

			const output = consoleErrorSpy.mock.calls[0][0]
			expect(output).toContain(multilineMessage)
			expect(output).toContain("Line 1")
			expect(output).toContain("Line 2")
			expect(output).toContain("Line 3")
		})

		it("should handle very long messages", () => {
			const longMessage = "A".repeat(1000)
			debug(longMessage)

			const output = consoleDebugSpy.mock.calls[0][0]
			expect(output).toContain(longMessage)
			expect(output.length).toBeGreaterThan(1000)
		})

		it("should handle unicode and emoji in messages", () => {
			const unicodeMessage = "Hello 你好 مرحبا שלום 🚀 🎉 ✨"
			info(unicodeMessage)

			const output = consoleInfoSpy.mock.calls[0][0]
			expect(output).toContain(unicodeMessage)
			expect(output).toContain("你好")
			expect(output).toContain("🚀")
			expect(output).toContain("🎉")
		})
	})

	describe("Type Safety", () => {
		it("should define LogLevel type with correct values", () => {
			// Type testing - verify LogLevel accepts only valid values
			const validLevels: LogLevel[] = ["info", "warn", "error", "debug"]
			expect(validLevels).toHaveLength(4)

			// Verify each level is a valid string
			validLevels.forEach((level) => {
				expect(typeof level).toBe("string")
			})

			// TypeScript will catch invalid values at compile time
			// This test verifies the type is properly exported and usable
		})
	})
})
