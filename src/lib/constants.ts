/**
 * Application constants and enums
 */

export const NODE_ENV_VALUES = [
	"development",
	"production",
	"test",
	"staging"
] as const
export const GREETING: string = "Hello, TypeScript Node.js World!"

export type NodeEnv = (typeof NODE_ENV_VALUES)[number]

export const LOG_LEVEL_VALUES = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"fatal",
	"silent"
] as const

export type LogLevel = (typeof LOG_LEVEL_VALUES)[number]
