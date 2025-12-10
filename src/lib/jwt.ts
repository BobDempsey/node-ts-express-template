/**
 * JWT token utilities for authentication.
 *
 * Provides functions for generating and verifying JWT tokens.
 * Requires ENABLE_JWT_AUTH=true and JWT_SECRET to be set.
 */

import jwt from "jsonwebtoken"
import env from "@/lib/env"

export interface TokenPayload {
	userId: string
	email: string
	type: "access" | "refresh"
}

interface JwtPayload extends TokenPayload {
	iat: number
	exp: number
}

/**
 * Get the JWT secret, throwing an error if not configured
 */
function getSecret(): string {
	if (!env.JWT_SECRET) {
		throw new Error(
			"JWT_SECRET is required when ENABLE_JWT_AUTH is true. " +
				"Set a secure secret (min 32 characters) in your environment."
		)
	}
	return env.JWT_SECRET
}

/**
 * Generate an access token for a user
 */
export function generateAccessToken(
	payload: Omit<TokenPayload, "type">
): string {
	const secret = getSecret()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return jwt.sign({ ...payload, type: "access" }, secret, {
		expiresIn: env.JWT_EXPIRY
	} as any)
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(
	payload: Omit<TokenPayload, "type">
): string {
	const secret = getSecret()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return jwt.sign({ ...payload, type: "refresh" }, secret, {
		expiresIn: env.JWT_REFRESH_EXPIRY
	} as any)
}

/**
 * Verify and decode a token
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
	const secret = getSecret()
	const decoded = jwt.verify(token, secret) as JwtPayload
	return {
		userId: decoded.userId,
		email: decoded.email,
		type: decoded.type
	}
}

/**
 * Decode a token without verification (for debugging/logging)
 * Returns null if token is malformed
 */
export function decodeToken(token: string): TokenPayload | null {
	const decoded = jwt.decode(token) as JwtPayload | null
	if (!decoded) return null
	return {
		userId: decoded.userId,
		email: decoded.email,
		type: decoded.type
	}
}
