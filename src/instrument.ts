/**
 * Sentry instrumentation - MUST be imported before all other modules
 *
 * This module initializes Sentry for error tracking, performance monitoring,
 * and request tracing. Import this at the very top of your entry point.
 */

import * as Sentry from "@sentry/node"
import dotenv from "dotenv"

// Load environment variables before reading them
dotenv.config({ quiet: true })

// Read environment variables directly (before env.ts validation)
const isProduction = process.env.NODE_ENV === "production"
const sentryDsn = process.env.SENTRY_DSN

// Only initialize if DSN is provided
if (sentryDsn) {
	const release = process.env.SENTRY_RELEASE
	Sentry.init({
		dsn: sentryDsn,
		environment:
			process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
		...(release && { release }),

		// Performance Monitoring
		tracesSampleRate: Number.parseFloat(
			process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"
		),
		profilesSampleRate: Number.parseFloat(
			process.env.SENTRY_PROFILES_SAMPLE_RATE || "1.0"
		),

		// Integrations
		integrations: [
			// HTTP instrumentation for tracing outbound requests
			Sentry.httpIntegration(),
			// Express instrumentation
			Sentry.expressIntegration()
		],

		// Don't send PII by default
		sendDefaultPii: false,

		// Filter out sensitive data
		beforeSend(event) {
			// Redact authorization headers if present
			if (event.request?.headers) {
				if (event.request.headers.authorization) {
					event.request.headers.authorization = "[REDACTED]"
				}
				if (event.request.headers.cookie) {
					event.request.headers.cookie = "[REDACTED]"
				}
			}
			return event
		},

		// Only enable debug in development when explicitly requested
		debug: !isProduction && process.env.SENTRY_DEBUG === "true"
	})

	console.log("[Sentry] Initialized successfully")
} else if (process.env.NODE_ENV !== "test") {
	console.log("[Sentry] DSN not provided, skipping initialization")
}

export { Sentry }
