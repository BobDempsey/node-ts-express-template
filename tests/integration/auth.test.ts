/**
 * Integration Tests for Authentication
 *
 * Test Coverage Plan:
 * 1. Login Flow
 *    - Should return tokens for valid credentials
 *    - Should return 401 for invalid email
 *    - Should return 401 for invalid password
 *    - Should return 400 for missing fields
 *
 * 2. Token Refresh Flow
 *    - Should return new access token for valid refresh token
 *    - Should return 401 for invalid refresh token
 *    - Should return 401 for access token (wrong type)
 *
 * 3. Protected Routes
 *    - Should allow access with valid token
 *    - Should return 401 without token
 *    - Should return 401 with invalid token
 *    - Should return 401 with expired token
 *
 * 4. Auth Middleware Path Exclusions
 *    - Should not require auth for excluded paths
 */

import express, {
	type NextFunction,
	type Request,
	type Response
} from "express"
import jwt from "jsonwebtoken"
import request from "supertest"

// Test secret - must be at least 32 characters
const TEST_SECRET = "test-secret-that-is-at-least-32-characters-long"

// Mock environment
jest.mock("@/lib/env", () => ({
	ENABLE_JWT_AUTH: true,
	JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
	JWT_EXPIRY: "1h",
	JWT_REFRESH_EXPIRY: "7d"
}))

import { UnauthorizedError } from "@/errors/unauthorized-error"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { requireAuth } from "@/middleware/auth"

// Create a test app with auth routes
const createTestApp = () => {
	const app = express()
	app.use(express.json())

	// Simple error handler for tests
	const errorHandler = (
		err: Error,
		_req: Request,
		res: Response,
		_next: NextFunction
	): void => {
		if (err instanceof UnauthorizedError) {
			res.status(401).json({
				error: err.message,
				code: "UNAUTHORIZED",
				statusCode: 401
			})
			return
		}
		res.status(500).json({ error: err.message })
	}

	// Auth middleware with exclusions
	app.use(
		requireAuth({
			exclude: ["/health", "/auth/login", "/auth/refresh", "/public"]
		})
	)

	// Public routes (excluded from auth)
	app.get("/health", (_req: Request, res: Response) => {
		res.json({ status: "ok" })
	})

	app.get("/public", (_req: Request, res: Response) => {
		res.json({ message: "public endpoint" })
	})

	// Auth routes
	app.post("/auth/login", (req: Request, res: Response): void => {
		const { email, password } = req.body

		// Simple validation
		if (!email || !password) {
			res.status(400).json({
				error: "Email and password are required",
				code: "VALIDATION_ERROR",
				statusCode: 400
			})
			return
		}

		// Check credentials (test user)
		if (email !== "test@example.com" || password !== "password123") {
			res.status(401).json({
				error: "Invalid credentials",
				code: "UNAUTHORIZED",
				statusCode: 401
			})
			return
		}

		// Generate tokens
		const tokenPayload = { userId: "1", email }
		const accessToken = generateAccessToken(tokenPayload)
		const refreshToken = generateRefreshToken(tokenPayload)

		res.json({
			accessToken,
			refreshToken,
			user: { id: "1", email }
		})
	})

	app.post("/auth/refresh", (req: Request, res: Response): void => {
		const { refreshToken } = req.body

		if (!refreshToken) {
			res.status(400).json({
				error: "Refresh token is required",
				code: "VALIDATION_ERROR",
				statusCode: 400
			})
			return
		}

		try {
			const decoded = jwt.verify(refreshToken, TEST_SECRET) as {
				userId: string
				email: string
				type: string
			}

			if (decoded.type !== "refresh") {
				res.status(401).json({
					error: "Invalid token type",
					code: "UNAUTHORIZED",
					statusCode: 401
				})
				return
			}

			const accessToken = generateAccessToken({
				userId: decoded.userId,
				email: decoded.email
			})

			res.json({ accessToken })
		} catch {
			res.status(401).json({
				error: "Invalid or expired refresh token",
				code: "UNAUTHORIZED",
				statusCode: 401
			})
		}
	})

	// Protected route
	app.get("/protected", (req: Request, res: Response) => {
		res.json({
			message: "protected data",
			user: req.user
		})
	})

	// Protected route - user info
	app.get("/me", (req: Request, res: Response): void => {
		if (!req.user) {
			res.status(401).json({
				error: "Not authenticated",
				code: "UNAUTHORIZED",
				statusCode: 401
			})
			return
		}
		res.json({
			userId: req.user.userId,
			email: req.user.email
		})
	})

	app.use(errorHandler)

	return app
}

describe("Authentication Integration", () => {
	describe("Login Flow", () => {
		it("should return tokens for valid credentials", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			expect(response.status).toBe(200)
			expect(response.body).toHaveProperty("accessToken")
			expect(response.body).toHaveProperty("refreshToken")
			expect(response.body).toHaveProperty("user")
			expect(response.body.user.email).toBe("test@example.com")
		})

		it("should return 401 for invalid email", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/login").send({
				email: "wrong@example.com",
				password: "password123"
			})

			expect(response.status).toBe(401)
			expect(response.body.error).toBe("Invalid credentials")
		})

		it("should return 401 for invalid password", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "wrongpassword"
			})

			expect(response.status).toBe(401)
			expect(response.body.error).toBe("Invalid credentials")
		})

		it("should return 400 for missing email", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/login").send({
				password: "password123"
			})

			expect(response.status).toBe(400)
		})

		it("should return 400 for missing password", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/login").send({
				email: "test@example.com"
			})

			expect(response.status).toBe(400)
		})
	})

	describe("Token Refresh Flow", () => {
		it("should return new access token for valid refresh token", async () => {
			const app = createTestApp()

			// First login to get refresh token
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { refreshToken } = loginResponse.body

			// Use refresh token to get new access token
			const refreshResponse = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken })

			expect(refreshResponse.status).toBe(200)
			expect(refreshResponse.body).toHaveProperty("accessToken")
		})

		it("should return 401 for invalid refresh token", async () => {
			const app = createTestApp()

			const response = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken: "invalid-token" })

			expect(response.status).toBe(401)
		})

		it("should return 401 when using access token as refresh token", async () => {
			const app = createTestApp()

			// Login to get access token
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { accessToken } = loginResponse.body

			// Try to use access token as refresh token
			const response = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken: accessToken })

			expect(response.status).toBe(401)
			expect(response.body.error).toBe("Invalid token type")
		})

		it("should return 400 for missing refresh token", async () => {
			const app = createTestApp()

			const response = await request(app).post("/auth/refresh").send({})

			expect(response.status).toBe(400)
		})
	})

	describe("Protected Routes", () => {
		it("should allow access with valid token", async () => {
			const app = createTestApp()

			// Login to get access token
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { accessToken } = loginResponse.body

			// Access protected route
			const response = await request(app)
				.get("/protected")
				.set("Authorization", `Bearer ${accessToken}`)

			expect(response.status).toBe(200)
			expect(response.body.message).toBe("protected data")
			expect(response.body.user).toBeDefined()
		})

		it("should return 401 without token", async () => {
			const app = createTestApp()

			const response = await request(app).get("/protected")

			expect(response.status).toBe(401)
		})

		it("should return 401 with invalid token", async () => {
			const app = createTestApp()

			const response = await request(app)
				.get("/protected")
				.set("Authorization", "Bearer invalid-token")

			expect(response.status).toBe(401)
		})

		it("should return 401 with malformed Authorization header", async () => {
			const app = createTestApp()

			const response = await request(app)
				.get("/protected")
				.set("Authorization", "InvalidFormat token")

			expect(response.status).toBe(401)
		})

		it("should return 401 with expired token", async () => {
			const app = createTestApp()

			// Create an expired token
			const expiredToken = jwt.sign(
				{ userId: "1", email: "test@example.com", type: "access" },
				TEST_SECRET,
				{ expiresIn: "-1s" }
			)

			const response = await request(app)
				.get("/protected")
				.set("Authorization", `Bearer ${expiredToken}`)

			expect(response.status).toBe(401)
		})

		it("should return 401 when using refresh token for protected route", async () => {
			const app = createTestApp()

			// Login to get refresh token
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { refreshToken } = loginResponse.body

			// Try to access protected route with refresh token
			const response = await request(app)
				.get("/protected")
				.set("Authorization", `Bearer ${refreshToken}`)

			expect(response.status).toBe(401)
		})
	})

	describe("Auth Middleware Path Exclusions", () => {
		it("should not require auth for /health", async () => {
			const app = createTestApp()

			const response = await request(app).get("/health")

			expect(response.status).toBe(200)
			expect(response.body.status).toBe("ok")
		})

		it("should not require auth for /public", async () => {
			const app = createTestApp()

			const response = await request(app).get("/public")

			expect(response.status).toBe(200)
			expect(response.body.message).toBe("public endpoint")
		})

		it("should not require auth for /auth/login", async () => {
			const app = createTestApp()

			// Should get 400 (validation error) not 401 (unauthorized)
			const response = await request(app).post("/auth/login").send({})

			expect(response.status).toBe(400)
		})

		it("should not require auth for /auth/refresh", async () => {
			const app = createTestApp()

			// Should get 400 (validation error) not 401 (unauthorized)
			const response = await request(app).post("/auth/refresh").send({})

			expect(response.status).toBe(400)
		})
	})

	describe("User Info Endpoint", () => {
		it("should return user info for authenticated request", async () => {
			const app = createTestApp()

			// Login
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { accessToken } = loginResponse.body

			// Get user info
			const response = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${accessToken}`)

			expect(response.status).toBe(200)
			expect(response.body.userId).toBe("1")
			expect(response.body.email).toBe("test@example.com")
		})
	})

	describe("Full Authentication Flow", () => {
		it("should complete login -> access -> refresh -> access flow", async () => {
			const app = createTestApp()

			// Step 1: Login
			const loginResponse = await request(app).post("/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})
			expect(loginResponse.status).toBe(200)

			const { accessToken, refreshToken } = loginResponse.body

			// Step 2: Access protected route with access token
			const protectedResponse = await request(app)
				.get("/protected")
				.set("Authorization", `Bearer ${accessToken}`)
			expect(protectedResponse.status).toBe(200)

			// Step 3: Refresh the access token
			const refreshResponse = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken })
			expect(refreshResponse.status).toBe(200)

			const newAccessToken = refreshResponse.body.accessToken

			// Step 4: Access protected route with new access token
			const finalResponse = await request(app)
				.get("/protected")
				.set("Authorization", `Bearer ${newAccessToken}`)
			expect(finalResponse.status).toBe(200)
		})
	})
})
