/**
 * Graceful shutdown handler for the server.
 */

import type { Server } from "node:http"
import { logger } from "@/lib/logger"
import { flush as flushSentry } from "@/lib/sentry"

export interface GracefulShutdownOptions {
	server: Server
	timeoutMs: number
	onShutdownStart?: () => void
}

let isShuttingDown = false

export function getShutdownState(): boolean {
	return isShuttingDown
}

export function resetShutdownState(): void {
	isShuttingDown = false
}

export async function gracefulShutdown(
	signal: string,
	options: GracefulShutdownOptions
): Promise<void> {
	const { server, timeoutMs, onShutdownStart } = options

	// Prevent multiple shutdown attempts
	if (isShuttingDown) {
		logger.warn(`${signal} received again, shutdown already in progress`)
		return
	}
	isShuttingDown = true

	onShutdownStart?.()
	logger.info(`${signal} received, shutting down gracefully...`)

	// Set a forced shutdown timeout
	const forceShutdownTimer = setTimeout(async () => {
		logger.error(
			`Graceful shutdown timed out after ${timeoutMs}ms, forcing exit`
		)
		await flushSentry(2000)
		process.exit(1)
	}, timeoutMs)

	// Don't keep the process alive just for this timer
	forceShutdownTimer.unref()

	// Close the server (stop accepting new connections)
	server.close(async (err) => {
		clearTimeout(forceShutdownTimer)

		if (err) {
			logger.error({ err }, "Error during server close")
			await flushSentry(2000)
			process.exit(1)
		}

		logger.info("Server closed, all connections finished")

		// Flush Sentry events before exit
		await flushSentry(2000)
		process.exit(0)
	})
}
