/**
 * Datadog APM Tracer initialization
 *
 * CRITICAL: This file must be imported FIRST in the application entry point
 * before any other modules are loaded. dd-trace uses monkey-patching to
 * instrument modules, which only works if it's loaded first.
 */

const isTest = process.env.NODE_ENV === "test"
const isTracingEnabled = process.env.DD_TRACE_ENABLED !== "false" && !isTest
const isProduction = process.env.NODE_ENV === "production"

// Only import and initialize dd-trace when tracing is enabled
// This prevents dd-trace from loading in test environments
let tracer: {
	init: (config: object) => void
	scope: () => { active: () => unknown }
}

if (isTracingEnabled) {
	// Dynamic import to prevent loading dd-trace in tests
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	tracer = require("dd-trace").default

	tracer.init({
		// Service name - defaults to DD_SERVICE env var if not specified
		service: process.env.DD_SERVICE || "node-ts-express-template",

		// Environment - defaults to DD_ENV env var
		env: process.env.DD_ENV || process.env.NODE_ENV || "development",

		// Version - defaults to DD_VERSION env var
		version: process.env.DD_VERSION || "1.0.0",

		// Enable runtime metrics (CPU, memory, event loop)
		runtimeMetrics: true,

		// Log injection - automatically adds trace IDs to Pino logs
		logInjection: true,

		// Profiling (optional - enable for deeper performance insights)
		profiling: isProduction,

		// Agent configuration (uses DD_AGENT_HOST env var by default)
		hostname: process.env.DD_AGENT_HOST || "localhost",
		port: Number(process.env.DD_TRACE_AGENT_PORT) || 8126
	})
} else {
	// Provide a no-op tracer for test/disabled environments
	tracer = {
		init: () => {},
		scope: () => ({ active: () => null })
	}
}

export default tracer
