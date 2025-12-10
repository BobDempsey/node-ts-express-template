/**
 * Authentication middleware for JWT-protected routes.
 *
 * Validates JWT tokens from the Authorization header and attaches
 * the decoded user payload to the request object.
 */

import type { NextFunction, Request, Response } from "express"
import { UnauthorizedError } from "@/errors/unauthorized-error"
import { verifyToken } from "@/lib/jwt"

export interface AuthOptions {
	/**
	 * Paths to exclude from authentication (e.g., ["/health", "/api/v1/auth"])
	 */
	exclude?: string[]
}

/**
 * Middleware factory that creates an authentication middleware.
 *
 * @param options - Configuration options
 * @returns Express middleware function
 *
 * @example
 * // Apply globally with exclusions
 * app.use(requireAuth({ exclude: ["/health", "/api/v1/auth"] }))
 *
 * @example
 * // Apply to specific routes
 * router.use(requireAuth())
 */
export function requireAuth(options: AuthOptions = {}) {
	const excludePaths = options.exclude ?? []

	return (req: Request, _res: Response, next: NextFunction): void => {
		// Check if path should be excluded
		const shouldExclude = excludePaths.some((path) => req.path.startsWith(path))
		if (shouldExclude) {
			next()
			return
		}

		// Extract token from Authorization header
		const authHeader = req.headers.authorization
		if (!authHeader) {
			throw new UnauthorizedError("Authorization header is required")
		}

		const parts = authHeader.split(" ")
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			throw new UnauthorizedError(
				"Authorization header must be: Bearer <token>"
			)
		}

		const token = parts[1]
		if (!token) {
			throw new UnauthorizedError("Token is required")
		}

		try {
			// Verify and decode the token
			const payload = verifyToken(token)

			// Ensure it's an access token, not a refresh token
			if (payload.type !== "access") {
				throw new UnauthorizedError("Invalid token type")
			}

			// Attach user to request
			req.user = payload
			next()
		} catch (error) {
			if (error instanceof UnauthorizedError) {
				throw error
			}
			// JWT verification errors
			throw new UnauthorizedError("Invalid or expired token")
		}
	}
}
