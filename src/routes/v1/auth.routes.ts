/**
 * Authentication routes for JWT-based auth.
 *
 * These routes are only mounted when ENABLE_JWT_AUTH=true.
 */

import { Router } from "express"
import { validate } from "@/middleware"
import { asyncHandler } from "@/utils"
import { getCurrentUser, login, refresh } from "./controllers/auth.controller"
import { loginSchema, refreshSchema } from "./schemas/auth.schemas"

const router = Router()

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
router.post("/auth/login", validate(loginSchema, "body"), asyncHandler(login))

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
	asyncHandler(refresh)
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
router.get("/auth/me", asyncHandler(getCurrentUser))

export default router
