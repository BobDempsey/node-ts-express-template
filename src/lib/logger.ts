// Basic custom logger for Node.js TypeScript app
// Supports log levels: info, warn, error, debug
// Adds timestamp to each log

export type LogLevel = "info" | "warn" | "error" | "debug"

const formatMessage = (level: LogLevel, message: string): string => {
	const timestamp = new Date().toISOString()
	return `[${timestamp}] [${level.toUpperCase()}] ${message}`
}

export const info = (message: string): void => {
	console.info(formatMessage("info", message))
}

export const warn = (message: string): void => {
	console.warn(formatMessage("warn", message))
}

export const error = (message: string): void => {
	console.error(formatMessage("error", message))
}

export const debug = (message: string): void => {
	console.debug(formatMessage("debug", message))
}

// Logger object for cleaner API and easier mocking in tests
export const logger = {
	info,
	warn,
	error,
	debug
}
