/**
 * Structured logger using Pino with Datadog trace correlation
 *
 * Features:
 * - JSON output in production for log aggregation
 * - Pretty-printed output in development for readability
 * - Configurable log level via LOG_LEVEL environment variable
 * - Child loggers for request-scoped context
 * - Datadog trace correlation (dd.trace_id, dd.span_id, dd.service, dd.env, dd.version)
 *
 * Note: This module reads process.env directly because it is loaded before
 * the env module's validation runs. LOG_LEVEL is validated by env.ts schema.
 */
import pino, { type Logger } from "pino"

import type { LogLevel as PinoLogLevel } from "@/lib/constants"

const isProduction = process.env.NODE_ENV === "production"
const isTest = process.env.NODE_ENV === "test"

// Default log levels: trace, debug, info, warn, error, fatal, silent
const logLevel: PinoLogLevel =
	(process.env.LOG_LEVEL as PinoLogLevel) || (isProduction ? "info" : "debug")

// Datadog metadata from environment variables
const ddService = process.env.DD_SERVICE || "node-ts-express-template"
const ddEnv = process.env.DD_ENV || process.env.NODE_ENV || "development"
const ddVersion = process.env.DD_VERSION || "1.0.0"

/**
 * Get current Datadog trace context
 * Returns trace_id and span_id if dd-trace is active, otherwise empty strings
 */
const getTraceContext = (): { trace_id: string; span_id: string } => {
	try {
		// Dynamic import to avoid issues if dd-trace is not initialized
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const ddTrace = require("dd-trace")
		const span = ddTrace.scope().active()

		if (span) {
			const context = span.context()
			return {
				trace_id: context.toTraceId(),
				span_id: context.toSpanId()
			}
		}
	} catch {
		// dd-trace not available or no active span
	}

	return { trace_id: "", span_id: "" }
}

/**
 * Mixin function to add Datadog trace context to every log entry
 */
const ddMixin = (): object => {
	const { trace_id, span_id } = getTraceContext()

	return {
		dd: {
			trace_id,
			span_id,
			service: ddService,
			env: ddEnv,
			version: ddVersion
		}
	}
}

// Configure transport for development (pretty printing)
const transport =
	!isProduction && !isTest
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "SYS:standard",
					ignore: "pid,hostname"
				}
			}
		: undefined

// Create the base logger instance with Datadog mixin
export const logger: Logger = pino({
	level: isTest ? "silent" : logLevel,
	...(transport && { transport }),
	// Add Datadog trace context to every log entry
	mixin: ddMixin,
	// Use ISO timestamp format (Datadog prefers this)
	timestamp: pino.stdTimeFunctions.isoTime,
	// Redact sensitive fields from logs
	redact: {
		paths: ["req.headers.authorization", "req.headers.cookie", "password"],
		censor: "[REDACTED]"
	},
	// Custom serializers for common objects
	serializers: {
		err: pino.stdSerializers.err,
		req: pino.stdSerializers.req,
		res: pino.stdSerializers.res
	}
})

// Export log level type for consumers
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

// Convenience methods that match the previous API for backwards compatibility
export const info = (msg: string, obj?: object): void => {
	if (obj) {
		logger.info(obj, msg)
	} else {
		logger.info(msg)
	}
}

export const warn = (msg: string, obj?: object): void => {
	if (obj) {
		logger.warn(obj, msg)
	} else {
		logger.warn(msg)
	}
}

export const error = (msg: string, obj?: object): void => {
	if (obj) {
		logger.error(obj, msg)
	} else {
		logger.error(msg)
	}
}

export const debug = (msg: string, obj?: object): void => {
	if (obj) {
		logger.debug(obj, msg)
	} else {
		logger.debug(msg)
	}
}

// Create a child logger with additional context (useful for request-scoped logging)
export const createChildLogger = (bindings: pino.Bindings): Logger => {
	return logger.child(bindings)
}

// Export trace context helper for use in middleware
export { getTraceContext }
