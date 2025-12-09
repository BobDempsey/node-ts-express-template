/**
 * Environment variable schema definition and validation using Zod.
 *
 * This module defines the expected environment variables for the application
 * using Zod schemas, validates them at runtime, and exports a parsed
 * environment object with type safety.
 */
import { z } from "zod"

import { LOG_LEVEL_VALUES, NODE_ENV_VALUES } from "@/lib/constants"
import tryParseEnv from "@/lib/try-parse-env"

const EnvSchema = z.object({
	NODE_ENV: z.enum(NODE_ENV_VALUES).optional(),
	PORT: z
		.string()
		.default("3000")
		.transform((val) => {
			const parsed = Number.parseInt(val, 10)
			return Number.isNaN(parsed) ? 3000 : parsed
		})
		.optional(),
	CORS_ORIGIN: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined
			// Support comma-separated origins
			return val.split(",").map((origin) => origin.trim())
		}),
	LOG_LEVEL: z.enum(LOG_LEVEL_VALUES).optional(),
	// Rate limiting configuration
	RATE_LIMIT_WINDOW_MS: z
		.string()
		.default("60000")
		.transform((val) => {
			const parsed = Number.parseInt(val, 10)
			return Number.isNaN(parsed) ? 60000 : parsed
		})
		.optional(),
	RATE_LIMIT_MAX_REQUESTS: z
		.string()
		.default("100")
		.transform((val) => {
			const parsed = Number.parseInt(val, 10)
			return Number.isNaN(parsed) ? 100 : parsed
		})
		.optional(),
	// Graceful shutdown timeout in milliseconds
	SHUTDOWN_TIMEOUT_MS: z
		.string()
		.default("30000")
		.transform((val) => {
			const parsed = Number.parseInt(val, 10)
			return Number.isNaN(parsed) ? 30000 : parsed
		})
		.optional(),
	// JWT Authentication (optional - enable with ENABLE_JWT_AUTH=true)
	ENABLE_JWT_AUTH: z
		.string()
		.default("false")
		.transform((val) => val === "true"),
	JWT_SECRET: z.string().min(32).optional(),
	JWT_EXPIRY: z.string().default("1h"),
	JWT_REFRESH_EXPIRY: z.string().default("7d")
})

export type EnvSchema = z.infer<typeof EnvSchema>

tryParseEnv(EnvSchema)

export default EnvSchema.parse(process.env)
