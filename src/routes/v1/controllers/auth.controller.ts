/**
 * Controller functions for authentication routes.
 */

import type { Request, Response } from "express"
import { UnauthorizedError } from "@/errors/unauthorized-error"
import {
	generateAccessToken,
	generateRefreshToken,
	verifyToken
} from "@/lib/jwt"
import { userService } from "@/services"
import { sendSuccess } from "@/utils"
import type { LoginInput, RefreshInput } from "../schemas/auth.schemas"

export async function login(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body as LoginInput

	// Find user by email
	const user = await userService.findByEmail(email)
	if (!user) {
		throw new UnauthorizedError("Invalid credentials")
	}

	// Validate password
	const isValid = await userService.validatePassword(user, password)
	if (!isValid) {
		throw new UnauthorizedError("Invalid credentials")
	}

	// Generate tokens
	const tokenPayload = { userId: user.id, email: user.email }
	const accessToken = generateAccessToken(tokenPayload)
	const refreshToken = generateRefreshToken(tokenPayload)

	sendSuccess(res, {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			email: user.email
		}
	})
}

export async function refresh(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body as RefreshInput

	try {
		// Verify the refresh token
		const payload = verifyToken(refreshToken)

		// Ensure it's a refresh token
		if (payload.type !== "refresh") {
			throw new UnauthorizedError("Invalid token type")
		}

		// Verify user still exists
		const user = await userService.findById(payload.userId)
		if (!user) {
			throw new UnauthorizedError("User not found")
		}

		// Generate new access token
		const accessToken = generateAccessToken({
			userId: user.id,
			email: user.email
		})

		sendSuccess(res, { accessToken })
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw error
		}
		throw new UnauthorizedError("Invalid or expired refresh token")
	}
}

export async function getCurrentUser(
	req: Request,
	res: Response
): Promise<void> {
	// This route requires authentication - req.user is set by auth middleware
	if (!req.user) {
		throw new UnauthorizedError("Authentication required")
	}

	sendSuccess(res, {
		userId: req.user.userId,
		email: req.user.email
	})
}
