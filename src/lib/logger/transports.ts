/**
 * Pino transport configuration for different environments.
 */

import type { TransportTargetOptions } from "pino"
import type { LogLevel as PinoLogLevel } from "@/lib/constants"

export interface TransportConfig {
	isProduction: boolean
	isTest: boolean
	logLevel: PinoLogLevel
	sentryDsn: string | undefined
	sentryEnvironment: string | undefined
	sentryRelease: string | undefined
}

export function buildTransports(
	config: TransportConfig
): TransportTargetOptions[] {
	const {
		isProduction,
		isTest,
		logLevel,
		sentryDsn,
		sentryEnvironment,
		sentryRelease
	} = config
	const targets: TransportTargetOptions[] = []

	// Add pretty printing for development
	if (!isProduction && !isTest) {
		targets.push({
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname"
			},
			level: logLevel
		})
	} else if (!isTest) {
		// Standard stdout for production
		targets.push({
			target: "pino/file",
			options: { destination: 1 }, // stdout
			level: logLevel
		})
	}

	// Add Sentry transport for error-level logs
	if (sentryDsn && !isTest) {
		targets.push({
			target: "pino-sentry-transport",
			options: {
				sentry: {
					dsn: sentryDsn,
					environment: sentryEnvironment || "development",
					release: sentryRelease
				},
				// Only send error and fatal level logs to Sentry
				minLevel: 50, // 50 = error, 60 = fatal
				withLogRecord: true // Include full log record as extra data
			},
			level: "error"
		})
	}

	return targets
}
