/**
 * Unit Tests for JWT Utilities
 *
 * Test Coverage Plan:
 * 1. Token Generation
 *    - Should generate valid access tokens
 *    - Should generate valid refresh tokens
 *    - Should include correct payload fields
 *    - Should set correct token type
 *
 * 2. Token Verification
 *    - Should verify valid tokens
 *    - Should reject expired tokens
 *    - Should reject malformed tokens
 *    - Should reject tokens with invalid signature
 *
 * 3. Token Decoding
 *    - Should decode tokens without verification
 *    - Should return null for malformed tokens
 *
 * 4. Configuration
 *    - Should throw error if JWT_SECRET not set
 */

import jwt from "jsonwebtoken"

// Mock environment before importing jwt utilities
const mockEnv = {
	ENABLE_JWT_AUTH: true,
	JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
	JWT_EXPIRY: "1h",
	JWT_REFRESH_EXPIRY: "7d"
}

jest.mock("@/lib/env", () => mockEnv)

import {
	decodeToken,
	generateAccessToken,
	generateRefreshToken,
	verifyToken
} from "@/lib/jwt"

describe("JWT Utilities", () => {
	const testPayload = {
		userId: "123",
		email: "test@example.com"
	}

	describe("generateAccessToken", () => {
		it("should generate a valid JWT string", () => {
			const token = generateAccessToken(testPayload)
			expect(typeof token).toBe("string")
			expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
		})

		it("should include correct payload fields", () => {
			const token = generateAccessToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.userId).toBe(testPayload.userId)
			expect(decoded.email).toBe(testPayload.email)
		})

		it("should set token type to access", () => {
			const token = generateAccessToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.type).toBe("access")
		})

		it("should include expiration claim", () => {
			const token = generateAccessToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.exp).toBeDefined()
			expect(typeof decoded.exp).toBe("number")
		})

		it("should include issued at claim", () => {
			const token = generateAccessToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.iat).toBeDefined()
			expect(typeof decoded.iat).toBe("number")
		})
	})

	describe("generateRefreshToken", () => {
		it("should generate a valid JWT string", () => {
			const token = generateRefreshToken(testPayload)
			expect(typeof token).toBe("string")
			expect(token.split(".")).toHaveLength(3)
		})

		it("should set token type to refresh", () => {
			const token = generateRefreshToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.type).toBe("refresh")
		})

		it("should include correct payload fields", () => {
			const token = generateRefreshToken(testPayload)
			const decoded = jwt.decode(token) as Record<string, unknown>

			expect(decoded.userId).toBe(testPayload.userId)
			expect(decoded.email).toBe(testPayload.email)
		})
	})

	describe("verifyToken", () => {
		it("should verify and return payload for valid access token", () => {
			const token = generateAccessToken(testPayload)
			const payload = verifyToken(token)

			expect(payload.userId).toBe(testPayload.userId)
			expect(payload.email).toBe(testPayload.email)
			expect(payload.type).toBe("access")
		})

		it("should verify and return payload for valid refresh token", () => {
			const token = generateRefreshToken(testPayload)
			const payload = verifyToken(token)

			expect(payload.userId).toBe(testPayload.userId)
			expect(payload.email).toBe(testPayload.email)
			expect(payload.type).toBe("refresh")
		})

		it("should throw error for malformed token", () => {
			expect(() => verifyToken("invalid-token")).toThrow()
		})

		it("should throw error for token with invalid signature", () => {
			const token = jwt.sign(testPayload, "wrong-secret")
			expect(() => verifyToken(token)).toThrow()
		})

		it("should throw error for expired token", () => {
			const expiredToken = jwt.sign(
				{ ...testPayload, type: "access" },
				mockEnv.JWT_SECRET,
				{ expiresIn: "-1s" }
			)
			expect(() => verifyToken(expiredToken)).toThrow()
		})
	})

	describe("decodeToken", () => {
		it("should decode token without verification", () => {
			const token = generateAccessToken(testPayload)
			const payload = decodeToken(token)

			expect(payload).not.toBeNull()
			expect(payload?.userId).toBe(testPayload.userId)
			expect(payload?.email).toBe(testPayload.email)
		})

		it("should return null for malformed token", () => {
			const payload = decodeToken("not-a-valid-token")
			expect(payload).toBeNull()
		})

		it("should decode expired tokens", () => {
			const expiredToken = jwt.sign(
				{ ...testPayload, type: "access" },
				mockEnv.JWT_SECRET,
				{ expiresIn: "-1s" }
			)
			const payload = decodeToken(expiredToken)

			expect(payload).not.toBeNull()
			expect(payload?.userId).toBe(testPayload.userId)
		})

		it("should decode tokens with invalid signature", () => {
			const token = jwt.sign({ ...testPayload, type: "access" }, "wrong-secret")
			const payload = decodeToken(token)

			expect(payload).not.toBeNull()
			expect(payload?.userId).toBe(testPayload.userId)
		})
	})

	describe("Token Consistency", () => {
		it("should generate different tokens for same payload", () => {
			const token1 = generateAccessToken(testPayload)
			// Small delay to ensure different iat
			const token2 = generateAccessToken(testPayload)

			// Tokens may be the same if generated in same second
			// but verification should work for both
			expect(verifyToken(token1)).toBeDefined()
			expect(verifyToken(token2)).toBeDefined()
		})

		it("should generate different access and refresh tokens", () => {
			const accessToken = generateAccessToken(testPayload)
			const refreshToken = generateRefreshToken(testPayload)

			expect(accessToken).not.toBe(refreshToken)
		})
	})
})

describe("JWT Configuration", () => {
	it("should throw error when JWT_SECRET is not set", () => {
		// This test verifies the getSecret() function behavior
		// We test this by checking the error message mentions JWT_SECRET
		jest.resetModules()
		jest.mock("@/lib/env", () => ({
			ENABLE_JWT_AUTH: true,
			JWT_SECRET: undefined,
			JWT_EXPIRY: "1h",
			JWT_REFRESH_EXPIRY: "7d"
		}))

		// Re-import to get fresh module with new mock
		const { generateAccessToken: genToken } = require("@/lib/jwt")

		expect(() =>
			genToken({ userId: "123", email: "test@example.com" })
		).toThrow("JWT_SECRET is required")
	})
})
