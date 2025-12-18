/**
 * Integration Tests for auth.routes.ts
 *
 * These tests cover the actual auth routes implementation to increase coverage.
 * Uses jest.isolateModules to ensure the env mock is applied before app import.
 */

import type { Express } from "express"
import type { Server } from "http"
import jwt from "jsonwebtoken"
import request from "supertest"

const TEST_SECRET = "test-secret-that-is-at-least-32-characters-long"

describe("Auth Routes Integration (auth.routes.ts)", () => {
	let app: Express
	let server: Server

	beforeAll(async () => {
		// Reset all modules to ensure clean slate
		jest.resetModules()

		// Mock environment BEFORE importing app
		jest.doMock("@/lib/env", () => ({
			NODE_ENV: "test",
			PORT: 0,
			ENABLE_JWT_AUTH: true,
			JWT_SECRET: TEST_SECRET,
			JWT_EXPIRY: "1h",
			JWT_REFRESH_EXPIRY: "7d",
			RATE_LIMIT_WINDOW_MS: 60000,
			RATE_LIMIT_MAX_REQUESTS: 1000,
			SHUTDOWN_TIMEOUT_MS: 30000,
			SENTRY_TRACES_SAMPLE_RATE: 1.0,
			SENTRY_PROFILES_SAMPLE_RATE: 1.0
		}))

		// Dynamically import app after mocking
		const appModule = await import("@/app")
		const indexModule = await import("@/index")
		app = appModule.app
		server = indexModule.default
	})

	afterAll((done) => {
		if (server) {
			server.close(done)
		} else {
			done()
		}
		jest.resetModules()
	})

	describe("POST /api/v1/auth/login", () => {
		it("should return tokens for valid credentials", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			expect(response.body.data).toHaveProperty("accessToken")
			expect(response.body.data).toHaveProperty("refreshToken")
			expect(response.body.data).toHaveProperty("user")
			expect(response.body.data.user.email).toBe("test@example.com")
			expect(response.body.data.user.id).toBe("1")
		})

		it("should return 401 for non-existent user", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				email: "nonexistent@example.com",
				password: "password123"
			})

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("UNAUTHORIZED")
		})

		it("should return 401 for invalid password", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "wrongpassword"
			})

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("UNAUTHORIZED")
		})

		it("should return 400 for missing email", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				password: "password123"
			})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("VALIDATION_ERROR")
		})

		it("should return 400 for missing password", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com"
			})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("VALIDATION_ERROR")
		})

		it("should return 400 for invalid email format", async () => {
			const response = await request(app).post("/api/v1/auth/login").send({
				email: "not-an-email",
				password: "password123"
			})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("VALIDATION_ERROR")
		})
	})

	describe("POST /api/v1/auth/refresh", () => {
		it("should return new access token for valid refresh token", async () => {
			// First login to get a refresh token
			const loginResponse = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { refreshToken } = loginResponse.body.data

			// Use refresh token to get new access token
			const response = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken })

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			expect(response.body.data).toHaveProperty("accessToken")
		})

		it("should return 401 for invalid refresh token", async () => {
			const response = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken: "invalid-token" })

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("UNAUTHORIZED")
		})

		it("should return 401 when using access token instead of refresh token", async () => {
			// Login to get access token
			const loginResponse = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { accessToken } = loginResponse.body.data

			// Try to use access token as refresh token
			const response = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken: accessToken })

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
			expect(response.body.error.message).toBe("Invalid token type")
		})

		it("should return 401 when user no longer exists", async () => {
			// Create a refresh token for a non-existent user
			const fakeRefreshToken = jwt.sign(
				{
					userId: "non-existent-user-id",
					email: "deleted@example.com",
					type: "refresh"
				},
				TEST_SECRET,
				{ expiresIn: "7d" }
			)

			const response = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken: fakeRefreshToken })

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
			expect(response.body.error.message).toBe("User not found")
		})

		it("should return 400 for missing refresh token", async () => {
			const response = await request(app).post("/api/v1/auth/refresh").send({})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.error.code).toBe("VALIDATION_ERROR")
		})

		it("should return 401 for expired refresh token", async () => {
			// Create an expired refresh token
			const expiredToken = jwt.sign(
				{
					userId: "1",
					email: "test@example.com",
					type: "refresh"
				},
				TEST_SECRET,
				{ expiresIn: "-1s" }
			)

			const response = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken: expiredToken })

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
		})
	})

	describe("GET /api/v1/auth/me", () => {
		it("should return user info for authenticated request", async () => {
			// Login to get access token
			const loginResponse = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { accessToken } = loginResponse.body.data

			// Get user info
			const response = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${accessToken}`)

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			expect(response.body.data.userId).toBe("1")
			expect(response.body.data.email).toBe("test@example.com")
		})

		it("should return 401 without authentication", async () => {
			const response = await request(app).get("/api/v1/auth/me")

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
		})

		it("should return 401 with invalid token", async () => {
			const response = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", "Bearer invalid-token")

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
		})

		it("should return 401 with expired token", async () => {
			// Create an expired access token
			const expiredToken = jwt.sign(
				{
					userId: "1",
					email: "test@example.com",
					type: "access"
				},
				TEST_SECRET,
				{ expiresIn: "-1s" }
			)

			const response = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${expiredToken}`)

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
		})

		it("should return 401 when using refresh token instead of access token", async () => {
			// Login to get refresh token
			const loginResponse = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})

			const { refreshToken } = loginResponse.body.data

			// Try to access /me with refresh token
			const response = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${refreshToken}`)

			expect(response.status).toBe(401)
			expect(response.body.success).toBe(false)
		})
	})

	describe("Full Authentication Flow", () => {
		it("should complete login -> access -> refresh -> access flow", async () => {
			// Step 1: Login
			const loginResponse = await request(app).post("/api/v1/auth/login").send({
				email: "test@example.com",
				password: "password123"
			})
			expect(loginResponse.status).toBe(200)

			const { accessToken, refreshToken } = loginResponse.body.data

			// Step 2: Access /me with access token
			const meResponse = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${accessToken}`)
			expect(meResponse.status).toBe(200)
			expect(meResponse.body.data.email).toBe("test@example.com")

			// Step 3: Refresh the access token
			const refreshResponse = await request(app)
				.post("/api/v1/auth/refresh")
				.send({ refreshToken })
			expect(refreshResponse.status).toBe(200)

			const newAccessToken = refreshResponse.body.data.accessToken

			// Step 4: Access /me with new access token
			const finalResponse = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${newAccessToken}`)
			expect(finalResponse.status).toBe(200)
			expect(finalResponse.body.data.email).toBe("test@example.com")
		})
	})
})
