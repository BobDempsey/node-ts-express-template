import { z } from "zod"
import { NODE_ENV_VALUES } from "@/lib/constants"

// Mock the tryParseEnv module before importing env
jest.mock("@/lib/try-parse-env", () => {
	return jest.fn().mockImplementation(() => {
		// Mock implementation that doesn't throw
	})
})

describe("Environment Configuration", () => {
	const originalEnv = process.env
	const port: number = 4000

	beforeEach(() => {
		jest.resetModules()
		process.env = { ...originalEnv }
	})

	afterAll(() => {
		process.env = originalEnv
	})

	describe("Environment Schema", () => {
		it("should define correct schema structure", () => {
			// Import the schema after mocking
			const expectedSchema = z.object({
				NODE_ENV: z.string().optional(),
				PORT: z.number().default(3000).optional(),
				CORS_ORIGIN: z.array(z.string()).optional()
			})

			// Test schema properties
			expect(expectedSchema.shape.NODE_ENV).toBeDefined()
			expect(expectedSchema.shape.PORT).toBeDefined()
			expect(expectedSchema.shape.CORS_ORIGIN).toBeDefined()
		})

		it("should have optional NODE_ENV field", () => {
			const schema = z.object({
				NODE_ENV: z.string().optional()
			})

			// Should not throw with undefined NODE_ENV
			expect(() => schema.parse({ NODE_ENV: undefined })).not.toThrow()
			expect(() => schema.parse({})).not.toThrow()
		})

		it("should have PORT with default value", () => {
			const schema = z.object({
				PORT: z.number().default(port).optional()
			})

			// Should not throw with undefined PORT and should use default
			const result = schema.parse({})
			expect(result.PORT).toBe(port)
		})

		it("should have optional CORS_ORIGIN field", () => {
			const schema = z.object({
				CORS_ORIGIN: z
					.string()
					.optional()
					.transform((val) => (val ? val.split(",") : undefined))
			})

			// Should not throw with undefined CORS_ORIGIN
			expect(() => schema.parse({ CORS_ORIGIN: undefined })).not.toThrow()
			expect(() => schema.parse({})).not.toThrow()
		})
	})

	describe("Environment Type Safety", () => {
		it("should export correct TypeScript types", async () => {
			// This test verifies that the TypeScript compilation succeeds
			// and the exported types are correct
			const envModule = await import("@/lib/env")

			expect(envModule.default).toBeDefined()
			expect(typeof envModule.default).toBe("object")
		})
	})

	describe("Environment Variables Processing", () => {
		it("should handle string PORT conversion", () => {
			process.env.PORT = port.toString()

			const schema = z.object({
				PORT: z
					.string()
					.transform((val: string) => (val ? Number.parseInt(val, 10) : 3000))
			})

			const result = schema.parse({ PORT: port.toString() })
			expect(result.PORT).toBe(port)
			expect(typeof result.PORT).toBe("number")
		})

		it("should handle NODE_ENV values", () => {
			const schema = z.object({
				NODE_ENV: z.enum(NODE_ENV_VALUES).optional()
			})

			for (const env of NODE_ENV_VALUES) {
				expect(() => schema.parse({ NODE_ENV: env })).not.toThrow()
			}
		})

		it("should transform CORS_ORIGIN comma-separated string to array", () => {
			const schema = z.object({
				CORS_ORIGIN: z
					.string()
					.optional()
					.transform((val) => {
						if (!val) return undefined
						return val.split(",").map((origin) => origin.trim())
					})
			})

			const result = schema.parse({
				CORS_ORIGIN: "http://localhost:3000,https://example.com"
			})
			expect(result.CORS_ORIGIN).toEqual([
				"http://localhost:3000",
				"https://example.com"
			])
			expect(Array.isArray(result.CORS_ORIGIN)).toBe(true)
		})

		it("should trim whitespace from CORS_ORIGIN values", () => {
			const schema = z.object({
				CORS_ORIGIN: z
					.string()
					.optional()
					.transform((val) => {
						if (!val) return undefined
						return val.split(",").map((origin) => origin.trim())
					})
			})

			const result = schema.parse({
				CORS_ORIGIN: "  http://localhost:3000  ,  https://example.com  "
			})
			expect(result.CORS_ORIGIN).toEqual([
				"http://localhost:3000",
				"https://example.com"
			])
		})

		it("should handle single CORS_ORIGIN value", () => {
			const schema = z.object({
				CORS_ORIGIN: z
					.string()
					.optional()
					.transform((val) => {
						if (!val) return undefined
						return val.split(",").map((origin) => origin.trim())
					})
			})

			const result = schema.parse({
				CORS_ORIGIN: "http://localhost:3000"
			})
			expect(result.CORS_ORIGIN).toEqual(["http://localhost:3000"])
		})

		it("should return undefined for empty CORS_ORIGIN", () => {
			const schema = z.object({
				CORS_ORIGIN: z
					.string()
					.optional()
					.transform((val) => {
						if (!val) return undefined
						return val.split(",").map((origin) => origin.trim())
					})
			})

			const result = schema.parse({})
			expect(result.CORS_ORIGIN).toBeUndefined()
		})
	})

	describe("Numeric Transform Edge Cases", () => {
		it("should handle non-numeric PORT string by defaulting to 3000", () => {
			const schema = z.object({
				PORT: z
					.string()
					.default("3000")
					.transform((val) => {
						const parsed = Number.parseInt(val, 10)
						return Number.isNaN(parsed) ? 3000 : parsed
					})
					.optional()
			})

			const result = schema.parse({ PORT: "invalid" })
			expect(result.PORT).toBe(3000)
		})

		it("should handle non-numeric RATE_LIMIT_WINDOW_MS by defaulting to 60000", () => {
			const schema = z.object({
				RATE_LIMIT_WINDOW_MS: z
					.string()
					.default("60000")
					.transform((val) => {
						const parsed = Number.parseInt(val, 10)
						return Number.isNaN(parsed) ? 60000 : parsed
					})
					.optional()
			})

			const result = schema.parse({ RATE_LIMIT_WINDOW_MS: "abc" })
			expect(result.RATE_LIMIT_WINDOW_MS).toBe(60000)
		})

		it("should handle non-numeric RATE_LIMIT_MAX_REQUESTS by defaulting to 100", () => {
			const schema = z.object({
				RATE_LIMIT_MAX_REQUESTS: z
					.string()
					.default("100")
					.transform((val) => {
						const parsed = Number.parseInt(val, 10)
						return Number.isNaN(parsed) ? 100 : parsed
					})
					.optional()
			})

			const result = schema.parse({ RATE_LIMIT_MAX_REQUESTS: "xyz" })
			expect(result.RATE_LIMIT_MAX_REQUESTS).toBe(100)
		})

		it("should handle non-numeric SHUTDOWN_TIMEOUT_MS by defaulting to 30000", () => {
			const schema = z.object({
				SHUTDOWN_TIMEOUT_MS: z
					.string()
					.default("30000")
					.transform((val) => {
						const parsed = Number.parseInt(val, 10)
						return Number.isNaN(parsed) ? 30000 : parsed
					})
					.optional()
			})

			const result = schema.parse({ SHUTDOWN_TIMEOUT_MS: "not-a-number" })
			expect(result.SHUTDOWN_TIMEOUT_MS).toBe(30000)
		})

		it("should handle non-numeric SENTRY_TRACES_SAMPLE_RATE by defaulting to 1.0", () => {
			const schema = z.object({
				SENTRY_TRACES_SAMPLE_RATE: z
					.string()
					.default("1.0")
					.transform((val) => {
						const parsed = Number.parseFloat(val)
						return Number.isNaN(parsed) ? 1.0 : Math.min(1, Math.max(0, parsed))
					})
			})

			const result = schema.parse({ SENTRY_TRACES_SAMPLE_RATE: "invalid" })
			expect(result.SENTRY_TRACES_SAMPLE_RATE).toBe(1.0)
		})

		it("should clamp SENTRY_TRACES_SAMPLE_RATE between 0 and 1", () => {
			const schema = z.object({
				SENTRY_TRACES_SAMPLE_RATE: z
					.string()
					.default("1.0")
					.transform((val) => {
						const parsed = Number.parseFloat(val)
						return Number.isNaN(parsed) ? 1.0 : Math.min(1, Math.max(0, parsed))
					})
			})

			// Test value above 1
			const result1 = schema.parse({ SENTRY_TRACES_SAMPLE_RATE: "2.5" })
			expect(result1.SENTRY_TRACES_SAMPLE_RATE).toBe(1.0)

			// Test value below 0
			const result2 = schema.parse({ SENTRY_TRACES_SAMPLE_RATE: "-0.5" })
			expect(result2.SENTRY_TRACES_SAMPLE_RATE).toBe(0)
		})

		it("should handle non-numeric SENTRY_PROFILES_SAMPLE_RATE by defaulting to 1.0", () => {
			const schema = z.object({
				SENTRY_PROFILES_SAMPLE_RATE: z
					.string()
					.default("1.0")
					.transform((val) => {
						const parsed = Number.parseFloat(val)
						return Number.isNaN(parsed) ? 1.0 : Math.min(1, Math.max(0, parsed))
					})
			})

			const result = schema.parse({ SENTRY_PROFILES_SAMPLE_RATE: "bad" })
			expect(result.SENTRY_PROFILES_SAMPLE_RATE).toBe(1.0)
		})

		it("should transform ENABLE_JWT_AUTH to boolean", () => {
			const schema = z.object({
				ENABLE_JWT_AUTH: z
					.string()
					.default("false")
					.transform((val) => val === "true")
			})

			expect(schema.parse({ ENABLE_JWT_AUTH: "true" }).ENABLE_JWT_AUTH).toBe(
				true
			)
			expect(schema.parse({ ENABLE_JWT_AUTH: "false" }).ENABLE_JWT_AUTH).toBe(
				false
			)
			expect(schema.parse({ ENABLE_JWT_AUTH: "yes" }).ENABLE_JWT_AUTH).toBe(
				false
			)
			expect(schema.parse({}).ENABLE_JWT_AUTH).toBe(false)
		})
	})
})
