/**
 * Sentry utility functions and re-exports
 */
import * as Sentry from "@sentry/node"

/**
 * Check if Sentry is enabled (DSN was provided)
 */
export const isSentryEnabled = (): boolean => {
	return !!process.env.SENTRY_DSN
}

/**
 * Capture an exception with optional context
 */
export const captureException = (
	error: Error,
	context?: Record<string, unknown>
): string | undefined => {
	if (!isSentryEnabled()) return undefined

	return Sentry.captureException(
		error,
		context ? { extra: context } : undefined
	)
}

/**
 * Capture a message with optional level and context
 */
export const captureMessage = (
	message: string,
	level: Sentry.SeverityLevel = "info",
	context?: Record<string, unknown>
): string | undefined => {
	if (!isSentryEnabled()) return undefined

	if (context) {
		return Sentry.captureMessage(message, {
			level,
			extra: context
		})
	}
	return Sentry.captureMessage(message, level)
}

/**
 * Set user context for error tracking
 */
export const setUser = (user: Sentry.User | null): void => {
	Sentry.setUser(user)
}

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
	Sentry.addBreadcrumb(breadcrumb)
}

/**
 * Flush pending events (useful before shutdown)
 */
export const flush = async (timeout = 2000): Promise<boolean> => {
	if (!isSentryEnabled()) return true
	return Sentry.flush(timeout)
}

/**
 * Close Sentry client
 */
export const close = async (timeout = 2000): Promise<boolean> => {
	if (!isSentryEnabled()) return true
	return Sentry.close(timeout)
}

export { Sentry }
