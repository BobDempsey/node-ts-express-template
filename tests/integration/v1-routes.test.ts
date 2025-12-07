import request from "supertest"
import server, { app } from "@/index"
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

		it("should return example JSON response", async () => {
			const response = await request(app).get("/api/v1/example")
			expect(response.body).toHaveProperty("message")
			expect(response.body).toHaveProperty("version")
			expect(response.body).toHaveProperty("timestamp")
			expect(response.body.message).toBe("This is an example endpoint")
			expect(response.body.version).toBe("v1")
		})

		it("should return valid ISO timestamp", async () => {
			const response = await request(app).get("/api/v1/example")
			const timestamp = new Date(response.body.timestamp)
			expect(timestamp.toISOString()).toBe(response.body.timestamp)
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
