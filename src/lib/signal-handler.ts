/**
 * Process signal and error handlers for server lifecycle.
 */

import type { Server } from "node:http"
import * as Sentry from "@sentry/node"
import { logger } from "@/lib/logger"
import { flush as flushSentry } from "@/lib/sentry"
import {
	type GracefulShutdownOptions,
	gracefulShutdown
} from "./graceful-shutdown"

const SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGHUP"]

export interface SignalHandlerOptions {
	server: Server
	shutdownTimeoutMs: number
}

export function setupSignalHandlers(options: SignalHandlerOptions): void {
	const { server, shutdownTimeoutMs } = options

	const shutdownOptions: GracefulShutdownOptions = {
		server,
		timeoutMs: shutdownTimeoutMs
	}

	// Handle termination signals
	for (const signal of SIGNALS) {
		process.on(signal, () => gracefulShutdown(signal, shutdownOptions))
	}

	// Handle uncaught exceptions
	process.on("uncaughtException", async (err) => {
		logger.fatal({ err }, "Uncaught exception, shutting down")

		Sentry.captureException(err, {
			level: "fatal",
			tags: { errorType: "UncaughtException" }
		})

		await flushSentry(2000)
		gracefulShutdown("uncaughtException", shutdownOptions)
	})

	// Handle unhandled promise rejections
	process.on("unhandledRejection", async (reason, promise) => {
		logger.fatal(
			{ reason, promise },
			"Unhandled promise rejection, shutting down"
		)

		const error = reason instanceof Error ? reason : new Error(String(reason))
		Sentry.captureException(error, {
			level: "fatal",
			tags: { errorType: "UnhandledRejection" },
			extra: { promise: String(promise) }
		})

		await flushSentry(2000)
		gracefulShutdown("unhandledRejection", shutdownOptions)
	})
}

export function cleanupSignalHandlers(): void {
	for (const signal of SIGNALS) {
		process.removeAllListeners(signal)
	}
	process.removeAllListeners("uncaughtException")
	process.removeAllListeners("unhandledRejection")
}
