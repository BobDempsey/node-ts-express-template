import * as Sentry from "@sentry/node"

// Mock Sentry SDK
jest.mock("@sentry/node", () => ({
	captureException: jest.fn(() => "mock-event-id"),
	captureMessage: jest.fn(() => "mock-event-id"),
	setUser: jest.fn(),
	addBreadcrumb: jest.fn(),
	flush: jest.fn(() => Promise.resolve(true)),
	close: jest.fn(() => Promise.resolve(true))
}))

// Import after mocking
import {
	addBreadcrumb,
	captureException,
	captureMessage,
	close,
	flush,
	isSentryEnabled,
	setUser
} from "@/lib/sentry"

describe("Sentry Utilities", () => {
	const originalEnv = process.env

	beforeEach(() => {
		jest.clearAllMocks()
		process.env = { ...originalEnv }
	})

	afterAll(() => {
		process.env = originalEnv
	})

	describe("isSentryEnabled", () => {
		it("should return true when SENTRY_DSN is set", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			expect(isSentryEnabled()).toBe(true)
		})

		it("should return false when SENTRY_DSN is not set", () => {
			delete process.env.SENTRY_DSN

			expect(isSentryEnabled()).toBe(false)
		})

		it("should return false when SENTRY_DSN is empty string", () => {
			process.env.SENTRY_DSN = ""

			expect(isSentryEnabled()).toBe(false)
		})
	})

	describe("captureException", () => {
		it("should capture exception when Sentry is enabled", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"
			const error = new Error("Test error")

			const eventId = captureException(error)

			expect(eventId).toBe("mock-event-id")
			expect(Sentry.captureException).toHaveBeenCalledWith(error, undefined)
		})

		it("should capture exception with context when provided", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"
			const error = new Error("Test error")
			const context = { userId: "123", action: "test" }

			const eventId = captureException(error, context)

			expect(eventId).toBe("mock-event-id")
			expect(Sentry.captureException).toHaveBeenCalledWith(error, {
				extra: context
			})
		})

		it("should return undefined when Sentry is disabled", () => {
			delete process.env.SENTRY_DSN
			const error = new Error("Test error")

			const eventId = captureException(error)

			expect(eventId).toBeUndefined()
			expect(Sentry.captureException).not.toHaveBeenCalled()
		})
	})

	describe("captureMessage", () => {
		it("should capture message when Sentry is enabled", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const eventId = captureMessage("Test message")

			expect(eventId).toBe("mock-event-id")
			expect(Sentry.captureMessage).toHaveBeenCalledWith("Test message", "info")
		})

		it("should capture message with custom level", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const eventId = captureMessage("Warning message", "warning")

			expect(eventId).toBe("mock-event-id")
			expect(Sentry.captureMessage).toHaveBeenCalledWith(
				"Warning message",
				"warning"
			)
		})

		it("should capture message with context", () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"
			const context = { feature: "auth" }

			const eventId = captureMessage("Test message", "info", context)

			expect(eventId).toBe("mock-event-id")
			expect(Sentry.captureMessage).toHaveBeenCalledWith("Test message", {
				level: "info",
				extra: context
			})
		})

		it("should return undefined when Sentry is disabled", () => {
			delete process.env.SENTRY_DSN

			const eventId = captureMessage("Test message")

			expect(eventId).toBeUndefined()
			expect(Sentry.captureMessage).not.toHaveBeenCalled()
		})
	})

	describe("setUser", () => {
		it("should set user context", () => {
			const user = { id: "123", email: "test@example.com" }

			setUser(user)

			expect(Sentry.setUser).toHaveBeenCalledWith(user)
		})

		it("should clear user context with null", () => {
			setUser(null)

			expect(Sentry.setUser).toHaveBeenCalledWith(null)
		})
	})

	describe("addBreadcrumb", () => {
		it("should add breadcrumb", () => {
			const breadcrumb = {
				category: "auth",
				message: "User logged in",
				level: "info" as const
			}

			addBreadcrumb(breadcrumb)

			expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb)
		})

		it("should add breadcrumb with all fields", () => {
			const breadcrumb = {
				category: "http",
				message: "API call",
				level: "info" as const,
				data: { url: "/api/test", method: "GET" }
			}

			addBreadcrumb(breadcrumb)

			expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb)
		})
	})

	describe("flush", () => {
		it("should flush pending events when Sentry is enabled", async () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const result = await flush()

			expect(result).toBe(true)
			expect(Sentry.flush).toHaveBeenCalledWith(2000)
		})

		it("should flush with custom timeout", async () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const result = await flush(5000)

			expect(result).toBe(true)
			expect(Sentry.flush).toHaveBeenCalledWith(5000)
		})

		it("should return true immediately when Sentry is disabled", async () => {
			delete process.env.SENTRY_DSN

			const result = await flush()

			expect(result).toBe(true)
			expect(Sentry.flush).not.toHaveBeenCalled()
		})
	})

	describe("close", () => {
		it("should close Sentry client when enabled", async () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const result = await close()

			expect(result).toBe(true)
			expect(Sentry.close).toHaveBeenCalledWith(2000)
		})

		it("should close with custom timeout", async () => {
			process.env.SENTRY_DSN = "https://key@sentry.io/123"

			const result = await close(5000)

			expect(result).toBe(true)
			expect(Sentry.close).toHaveBeenCalledWith(5000)
		})

		it("should return true immediately when Sentry is disabled", async () => {
			delete process.env.SENTRY_DSN

			const result = await close()

			expect(result).toBe(true)
			expect(Sentry.close).not.toHaveBeenCalled()
		})
	})
})
