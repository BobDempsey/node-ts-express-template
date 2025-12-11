/**
 * Authentication routes for JWT-based auth.
 *
 * These routes are only mounted when ENABLE_JWT_AUTH=true.
 */

import { type Request, type Response, Router } from "express"
import { z } from "zod"
import { UnauthorizedError } from "@/errors/unauthorized-error"
import {
	generateAccessToken,
	generateRefreshToken,
	verifyToken
} from "@/lib/jwt"
import { validate } from "@/middleware"
import { userService } from "@/services"
import { asyncHandler, sendSuccess } from "@/utils"

const router = Router()

// Validation schemas
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required")
})

const refreshSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required")
})

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with credentials
 *     description: Authenticate with email and password to receive JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Short-lived access token for API requests
 *                 refreshToken:
 *                   type: string
 *                   description: Long-lived token for refreshing access tokens
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
	"/auth/login",
	validate(loginSchema, "body"),
	asyncHandler(async (req: Request, res: Response) => {
		const { email, password } = req.body as z.infer<typeof loginSchema>

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
	})
)

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
	"/auth/refresh",
	validate(refreshSchema, "body"),
	asyncHandler(async (req: Request, res: Response) => {
		const { refreshToken } = req.body as z.infer<typeof refreshSchema>

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
	})
)

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user
 *     description: Returns the authenticated user's information (requires valid access token)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Not authenticated
 */
router.get(
	"/auth/me",
	asyncHandler(async (req: Request, res: Response) => {
		// This route requires authentication - req.user is set by auth middleware
		if (!req.user) {
			throw new UnauthorizedError("Authentication required")
		}

		sendSuccess(res, {
			userId: req.user.userId,
			email: req.user.email
		})
	})
)

export default router
