import request from "supertest"
import { app } from "@/app"
import server from "@/index"
import { GREETING } from "@/lib/constants"

describe("API v1 Routes Integration Tests", () => {
	afterAll((done) => {
		server.close(done)
	})

	describe("GET /api/v1/", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/api/v1/")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(app).get("/api/v1/")
			expect(response.headers["content-type"]).toMatch(/text\/html/)
		})

		it("should return expected message", async () => {
			const response = await request(app).get("/api/v1/")
			expect(response.text).toBe(GREETING)
		})
	})

	describe("GET /api/v1/example", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/api/v1/example")
			expect(response.status).toBe(200)
		})

		it("should return JSON content type", async () => {
			const response = await request(app).get("/api/v1/example")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return example JSON response in data envelope", async () => {
			const response = await request(app).get("/api/v1/example")
			expect(response.body).toHaveProperty("success", true)
			expect(response.body).toHaveProperty("data")
			expect(response.body).toHaveProperty("meta")
			expect(response.body.data).toHaveProperty("message")
			expect(response.body.data).toHaveProperty("version")
			expect(response.body.data.message).toBe("This is an example endpoint")
			expect(response.body.data.version).toBe("v1")
		})

		it("should return valid ISO timestamp in meta", async () => {
			const response = await request(app).get("/api/v1/example")
			const timestamp = new Date(response.body.meta.timestamp)
			expect(timestamp.toISOString()).toBe(response.body.meta.timestamp)
		})
	})

	describe("GET /api/v1/async-example", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/api/v1/async-example")
			expect(response.status).toBe(200)
		})

		it("should return JSON content type", async () => {
			const response = await request(app).get("/api/v1/async-example")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return async example response in data envelope", async () => {
			const response = await request(app).get("/api/v1/async-example")
			expect(response.body).toHaveProperty("success", true)
			expect(response.body).toHaveProperty("data")
			expect(response.body).toHaveProperty("meta")
			expect(response.body.data).toHaveProperty("message")
			expect(response.body.data).toHaveProperty("version")
			expect(response.body.data).toHaveProperty("description")
			expect(response.body.data.message).toBe(
				"This is an async endpoint example"
			)
			expect(response.body.data.version).toBe("v1")
			expect(response.body.data.description).toBe(
				"Wrapped with asyncHandler to catch promise rejections"
			)
		})

		it("should return valid ISO timestamp in meta", async () => {
			const response = await request(app).get("/api/v1/async-example")
			const timestamp = new Date(response.body.meta.timestamp)
			expect(timestamp.toISOString()).toBe(response.body.meta.timestamp)
		})
	})

	describe("GET /api/v1/async-error-example", () => {
		it("should respond with 500 status (intentional error)", async () => {
			const response = await request(app).get("/api/v1/async-error-example")
			expect(response.status).toBe(500)
		})

		it("should return JSON content type", async () => {
			const response = await request(app).get("/api/v1/async-error-example")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return error response with correct structure", async () => {
			const response = await request(app).get("/api/v1/async-error-example")
			expect(response.body).toHaveProperty("success", false)
			expect(response.body).toHaveProperty("error")
			expect(response.body.error).toHaveProperty("code")
			expect(response.body.error).toHaveProperty("statusCode", 500)
		})

		it("should demonstrate async error handling", async () => {
			const response = await request(app).get("/api/v1/async-error-example")
			// The error is caught by asyncHandler and passed to error middleware
			expect(response.status).toBe(500)
		})
	})

	describe("Security Headers on v1 Routes", () => {
		it("should set security headers on /api/v1/", async () => {
			const response = await request(app).get("/api/v1/")
			expect(response.headers["content-security-policy"]).toBeDefined()
			expect(response.headers["x-content-type-options"]).toBe("nosniff")
			expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN")
		})

		it("should set security headers on /api/v1/example", async () => {
			const response = await request(app).get("/api/v1/example")
			expect(response.headers["content-security-policy"]).toBeDefined()
			expect(response.headers["x-content-type-options"]).toBe("nosniff")
		})
	})

	describe("Error Handling on v1 Routes", () => {
		it("should return 404 for undefined v1 routes", async () => {
			const response = await request(app).get("/api/v1/nonexistent")
			expect(response.status).toBe(404)
			expect(response.body).toEqual({ error: "Not Found" })
		})

		it("should return 404 for unsupported methods on v1 routes", async () => {
			const response = await request(app).post("/api/v1/")
			expect(response.status).toBe(404)
		})
	})
})
