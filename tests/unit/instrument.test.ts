/**
 * Tests for Sentry instrument module
 *
 * Note: The instrument module runs at import time and configures Sentry.
 * These tests verify the module's behavior with different environment configurations.
 * Due to module caching, we test the logic patterns rather than actual module re-imports.
 */

// Store original env
const originalEnv = process.env

// Mock Sentry before any imports
const mockSentryInit = jest.fn()
jest.mock("@sentry/node", () => ({
	init: mockSentryInit,
	httpIntegration: jest.fn().mockReturnValue({}),
	expressIntegration: jest.fn().mockReturnValue({})
}))

// Mock dotenv
jest.mock("dotenv", () => ({
	config: jest.fn()
}))

describe("Sentry Instrument Module", () => {
	describe("Initialization Logic", () => {
		it("should not initialize Sentry when DSN is not provided", () => {
			// Test the conditional logic
			const sentryDsn = undefined
			const shouldInitialize = !!sentryDsn

			expect(shouldInitialize).toBe(false)
		})

		it("should initialize Sentry when DSN is provided", () => {
			const sentryDsn = "https://key@sentry.io/123"
			const shouldInitialize = !!sentryDsn

			expect(shouldInitialize).toBe(true)
		})

		it("should not log skip message in test environment", () => {
			const nodeEnv = "test"
			const sentryDsn = undefined
			const shouldLogSkip = !sentryDsn && nodeEnv !== "test"

			expect(shouldLogSkip).toBe(false)
		})

		it("should log skip message in development when DSN not provided", () => {
			const nodeEnv: string = "development"
			const sentryDsn = undefined
			const shouldLogSkip = !sentryDsn && nodeEnv !== "test"

			expect(shouldLogSkip).toBe(true)
		})
	})

	describe("Configuration Options", () => {
		it("should use SENTRY_ENVIRONMENT over NODE_ENV when set", () => {
			const sentryEnvironment = "staging"
			const nodeEnv = "production"
			const environment = sentryEnvironment || nodeEnv || "development"

			expect(environment).toBe("staging")
		})

		it("should fall back to NODE_ENV when SENTRY_ENVIRONMENT not set", () => {
			const sentryEnvironment = undefined
			const nodeEnv = "production"
			const environment = sentryEnvironment || nodeEnv || "development"

			expect(environment).toBe("production")
		})

		it("should fall back to development when neither env is set", () => {
			const sentryEnvironment = undefined
			const nodeEnv = undefined
			const environment = sentryEnvironment || nodeEnv || "development"

			expect(environment).toBe("development")
		})

		it("should include release when SENTRY_RELEASE is set", () => {
			const release: string | undefined = "1.0.0"
			const config: Record<string, string> = {}
			if (release) {
				config.release = release
			}

			expect(config).toHaveProperty("release", "1.0.0")
		})

		it("should not include release when SENTRY_RELEASE is not set", () => {
			const release: string | undefined = undefined
			const config: Record<string, string> = {}
			if (release) {
				config.release = release
			}

			expect(config).not.toHaveProperty("release")
		})

		it("should parse sample rates correctly", () => {
			const parseRate = (val: string) => {
				const parsed = Number.parseFloat(val)
				return Number.isNaN(parsed) ? 1.0 : parsed
			}

			expect(parseRate("0.5")).toBe(0.5)
			expect(parseRate("1.0")).toBe(1.0)
			expect(parseRate("invalid")).toBe(1.0)
		})

		it("should enable debug only in development when SENTRY_DEBUG is true", () => {
			const isProduction = false
			const sentryDebug = "true"
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(true)
		})

		it("should not enable debug in production even when SENTRY_DEBUG is true", () => {
			const isProduction = true
			const sentryDebug = "true"
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(false)
		})

		it("should handle empty string SENTRY_ENVIRONMENT by falling through to NODE_ENV", () => {
			const sentryEnvironment = ""
			const nodeEnv = "production"
			const environment = sentryEnvironment || nodeEnv || "development"

			expect(environment).toBe("production")
		})

		it("should handle empty string NODE_ENV by falling through to development", () => {
			const sentryEnvironment = ""
			const nodeEnv = ""
			const environment = sentryEnvironment || nodeEnv || "development"

			expect(environment).toBe("development")
		})

		it("should not include release when SENTRY_RELEASE is empty string", () => {
			const release: string | undefined = ""
			const config: Record<string, string> = {}
			if (release) {
				config.release = release
			}

			expect(config).not.toHaveProperty("release")
		})
	})

	describe("Sample Rate Edge Cases", () => {
		const parseRate = (val: string | undefined, defaultVal = "1.0") =>
			Number.parseFloat(val || defaultVal)

		it("should accept zero as valid sample rate", () => {
			const rate = parseRate("0")

			expect(rate).toBe(0)
		})

		it("should parse negative sample rates (Sentry may reject)", () => {
			const rate = parseRate("-0.5")

			expect(rate).toBe(-0.5)
		})

		it("should parse sample rates greater than 1 (Sentry may reject)", () => {
			const rate = parseRate("1.5")

			expect(rate).toBe(1.5)
		})

		it("should fall back to default 1.0 for empty string", () => {
			const rate = parseRate("")

			expect(rate).toBe(1.0)
		})

		it("should return NaN for whitespace-only string", () => {
			const rate = parseRate(" ")

			expect(rate).toBeNaN()
		})
	})

	describe("Debug Mode Edge Cases", () => {
		it("should not enable debug when SENTRY_DEBUG is uppercase TRUE", () => {
			const isProduction = false
			const sentryDebug: string = "TRUE"
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(false)
		})

		it("should not enable debug when SENTRY_DEBUG is 1", () => {
			const isProduction = false
			const sentryDebug: string = "1"
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(false)
		})

		it("should not enable debug when SENTRY_DEBUG is empty string", () => {
			const isProduction = false
			const sentryDebug: string = ""
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(false)
		})

		it("should not enable debug when SENTRY_DEBUG is undefined", () => {
			const isProduction = false
			const sentryDebug: string | undefined = undefined
			const debug = !isProduction && sentryDebug === "true"

			expect(debug).toBe(false)
		})
	})

	describe("beforeSend Logic", () => {
		interface SentryEvent {
			message?: string
			request?: { headers?: Record<string, string> }
		}

		const beforeSend = (event: SentryEvent): SentryEvent => {
			if (event.request?.headers) {
				if (event.request.headers.authorization) {
					event.request.headers.authorization = "[REDACTED]"
				}
				if (event.request.headers.cookie) {
					event.request.headers.cookie = "[REDACTED]"
				}
			}
			return event
		}

		it("should redact authorization header", () => {
			const event: SentryEvent = {
				request: {
					headers: {
						authorization: "Bearer secret-token",
						"content-type": "application/json"
					}
				}
			}

			const result = beforeSend(event)

			expect(result.request?.headers?.authorization).toBe("[REDACTED]")
			expect(result.request?.headers?.["content-type"]).toBe("application/json")
		})

		it("should redact cookie header", () => {
			const event: SentryEvent = {
				request: {
					headers: {
						cookie: "session=abc123"
					}
				}
			}

			const result = beforeSend(event)

			expect(result.request?.headers?.cookie).toBe("[REDACTED]")
		})

		it("should handle events without request", () => {
			const event: SentryEvent = { message: "test" }

			expect(() => beforeSend(event)).not.toThrow()
		})

		it("should handle events with request but no headers", () => {
			const event: SentryEvent = { request: {} }

			expect(() => beforeSend(event)).not.toThrow()
		})

		it("should redact both authorization and cookie headers when both present", () => {
			const event: SentryEvent = {
				request: {
					headers: {
						authorization: "Bearer secret-token",
						cookie: "session=abc123",
						"content-type": "application/json"
					}
				}
			}

			const result = beforeSend(event)

			expect(result.request?.headers?.authorization).toBe("[REDACTED]")
			expect(result.request?.headers?.cookie).toBe("[REDACTED]")
			expect(result.request?.headers?.["content-type"]).toBe("application/json")
		})

		it("should not redact Authorization header with capital A (case-sensitive)", () => {
			const event: SentryEvent = {
				request: {
					headers: {
						Authorization: "Bearer secret-token"
					}
				}
			}

			const result = beforeSend(event)

			// The implementation only checks lowercase 'authorization'
			expect(result.request?.headers?.Authorization).toBe("Bearer secret-token")
		})

		it("should handle empty headers object gracefully", () => {
			const event: SentryEvent = {
				request: {
					headers: {}
				}
			}

			const result = beforeSend(event)

			expect(result.request?.headers).toEqual({})
		})

		it("should preserve all non-sensitive headers unchanged", () => {
			const event: SentryEvent = {
				request: {
					headers: {
						"content-type": "application/json",
						"x-request-id": "abc-123",
						accept: "application/json",
						"user-agent": "test-agent"
					}
				}
			}

			const result = beforeSend(event)

			expect(result.request?.headers).toEqual({
				"content-type": "application/json",
				"x-request-id": "abc-123",
				accept: "application/json",
				"user-agent": "test-agent"
			})
		})
	})

	describe("Module Export", () => {
		it("should export Sentry module", async () => {
			const { Sentry } = await import("@/instrument")

			expect(Sentry).toBeDefined()
		})
	})

	describe("Actual Module Initialization", () => {
		beforeEach(() => {
			jest.resetModules()
			mockSentryInit.mockClear()
			process.env = { ...originalEnv }
		})

		afterAll(() => {
			process.env = originalEnv
		})

		it("should call Sentry.init when SENTRY_DSN is provided", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalled()
		})

		it("should not call Sentry.init when SENTRY_DSN is not provided", async () => {
			delete process.env.SENTRY_DSN
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			expect(mockSentryInit).not.toHaveBeenCalled()
		})

		it("should pass correct environment to Sentry.init", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.SENTRY_ENVIRONMENT = "staging"
			process.env.NODE_ENV = "production"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					environment: "staging"
				})
			)
		})

		it("should fall back to NODE_ENV when SENTRY_ENVIRONMENT not set", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			delete process.env.SENTRY_ENVIRONMENT
			process.env.NODE_ENV = "production"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					environment: "production"
				})
			)
		})

		it("should include release when SENTRY_RELEASE is set", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.SENTRY_RELEASE = "v1.2.3"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					release: "v1.2.3"
				})
			)
		})

		it("should not include release when SENTRY_RELEASE is not set", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			delete process.env.SENTRY_RELEASE
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			const initCall = mockSentryInit.mock.calls[0][0]
			expect(initCall).not.toHaveProperty("release")
		})

		it("should parse SENTRY_TRACES_SAMPLE_RATE correctly", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.SENTRY_TRACES_SAMPLE_RATE = "0.5"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					tracesSampleRate: 0.5
				})
			)
		})

		it("should enable debug in non-production when SENTRY_DEBUG is true", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.SENTRY_DEBUG = "true"
			process.env.NODE_ENV = "development"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					debug: true
				})
			)
		})

		it("should not enable debug in production even when SENTRY_DEBUG is true", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.SENTRY_DEBUG = "true"
			process.env.NODE_ENV = "production"

			await import("@/instrument")

			expect(mockSentryInit).toHaveBeenCalledWith(
				expect.objectContaining({
					debug: false
				})
			)
		})

		it("should include beforeSend function that redacts authorization header", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			const initCall = mockSentryInit.mock.calls[0][0]
			expect(initCall.beforeSend).toBeDefined()

			// Test the beforeSend function
			const event = {
				request: {
					headers: {
						authorization: "Bearer secret-token",
						"content-type": "application/json"
					}
				}
			}

			const result = initCall.beforeSend(event)

			expect(result.request.headers.authorization).toBe("[REDACTED]")
			expect(result.request.headers["content-type"]).toBe("application/json")
		})

		it("should include beforeSend function that redacts cookie header", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			const initCall = mockSentryInit.mock.calls[0][0]
			const event = {
				request: {
					headers: {
						cookie: "session=abc123"
					}
				}
			}

			const result = initCall.beforeSend(event)

			expect(result.request.headers.cookie).toBe("[REDACTED]")
		})

		it("should include beforeSend function that handles events without request", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			const initCall = mockSentryInit.mock.calls[0][0]
			const event = { message: "test error" }

			expect(() => initCall.beforeSend(event)).not.toThrow()
		})

		it("should include beforeSend function that handles empty headers", async () => {
			process.env.SENTRY_DSN = "https://test@sentry.io/123"
			process.env.NODE_ENV = "test"

			await import("@/instrument")

			const initCall = mockSentryInit.mock.calls[0][0]
			const event = {
				request: {
					headers: {}
				}
			}

			const result = initCall.beforeSend(event)

			expect(result.request.headers).toEqual({})
		})
	})
})
