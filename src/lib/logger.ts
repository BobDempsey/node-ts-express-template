/**
 * Structured logger using Pino with optional Sentry transport
 *
 * Features:
 * - JSON output in production for log aggregation
 * - Pretty-printed output in development for readability
 * - Configurable log level via LOG_LEVEL environment variable
 * - Automatic error forwarding to Sentry via pino-sentry-transport
 * - Child loggers for request-scoped context
 *
 * Note: This module reads process.env directly because it is loaded before
 * the env module's validation runs. LOG_LEVEL is validated by env.ts schema.
 */
import pino, { type Logger } from "pino"

import type { LogLevel as PinoLogLevel } from "@/lib/constants"
import { buildTransports } from "@/lib/logger/transports"

const isProduction = process.env.NODE_ENV === "production"
const isTest = process.env.NODE_ENV === "test"

// Default log levels: trace, debug, info, warn, error, fatal, silent
const logLevel: PinoLogLevel =
	(process.env.LOG_LEVEL as PinoLogLevel) || (isProduction ? "info" : "debug")

const transports = buildTransports({
	isProduction,
	isTest,
	logLevel,
	sentryDsn: process.env.SENTRY_DSN,
	sentryEnvironment:
		process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
	sentryRelease: process.env.SENTRY_RELEASE
})

// Create the base logger instance
export const logger: Logger = pino({
	level: isTest ? "silent" : logLevel,
	...(transports.length > 0 && {
		transport: {
			targets: transports
		}
	}),
	// Redact sensitive fields from logs
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"password",
			"token",
			"apiKey",
			"secret"
		],
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
