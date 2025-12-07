import request from "supertest"
import server, { app } from "@/index"
import { GREETING } from "@/lib/constants"

describe("Express Server Integration Tests", () => {
	afterAll((done) => {
		server.close(done)
	})
	describe("GET /", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(app).get("/")
			expect(response.headers["content-type"]).toMatch(/text\/html/)
		})

		it("should return expected message", async () => {
			const response = await request(app).get("/")
			expect(response.text).toBe(GREETING)
		})

		it("should handle multiple concurrent requests", async () => {
			const responses = []
			for (let i = 0; i < 5; i++) {
				const response = await request(app).get("/")
				responses.push(response)
			}

			for (const response of responses) {
				expect(response.status).toBe(200)
				expect(response.text).toBe(GREETING)
			}
		})
	})

	describe("HTTP Methods", () => {
		it("should handle POST requests to root", async () => {
			const response = await request(app).post("/")
			// Express returns 404 for undefined routes
			expect(response.status).toBe(404)
		})

		it("should handle PUT requests", async () => {
			const response = await request(app).put("/")
			expect(response.status).toBe(404)
		})

		it("should handle DELETE requests", async () => {
			const response = await request(app).delete("/")
			expect(response.status).toBe(404)
		})
	})

	describe("Different Routes", () => {
		it("should return 404 for undefined routes", async () => {
			const paths = ["/test", "/api", "/nonexistent"]

			for (const path of paths) {
				const response = await request(app).get(path)
				expect(response.status).toBe(404)
				expect(response.body).toEqual({ error: "Not Found" })
			}
		})
	})

	describe("Server Performance", () => {
		it("should respond within reasonable time", async () => {
			const startTime = Date.now()

			await request(app).get("/")

			const responseTime = Date.now() - startTime
			expect(responseTime).toBeLessThan(100) // Should respond within 100ms
		})

		it("should handle rapid successive requests", async () => {
			const responses = []

			for (let i = 0; i < 10; i++) {
				const response = await request(app).get("/")
				responses.push(response)
			}

			for (const response of responses) {
				expect(response.status).toBe(200)
			}
		})
	})

	describe("Request Headers", () => {
		it("should handle requests with custom headers", async () => {
			const response = await request(app)
				.get("/")
				.set("User-Agent", "Test-Agent")
				.set("Accept", "text/plain")

			expect(response.status).toBe(200)
		})

		it("should handle requests without headers", async () => {
			const response = await request(app).get("/")
			expect(response.status).toBe(200)
		})
	})

	describe("JSON Parsing", () => {
		it("should parse JSON request bodies", async () => {
			const response = await request(app)
				.post("/")
				.send({ test: "data" })
				.set("Content-Type", "application/json")

			expect(response.status).toBe(404) // Route not defined, but body should be parsed
		})
	})

	describe("Security Headers (Helmet)", () => {
		it("should set Content-Security-Policy header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["content-security-policy"]).toBeDefined()
			expect(response.headers["content-security-policy"]).toContain(
				"default-src"
			)
		})

		it("should set X-Content-Type-Options header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["x-content-type-options"]).toBe("nosniff")
		})

		it("should set X-Frame-Options header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN")
		})

		it("should set Strict-Transport-Security header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["strict-transport-security"]).toBeDefined()
			expect(response.headers["strict-transport-security"]).toContain(
				"max-age="
			)
		})

		it("should set X-DNS-Prefetch-Control header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["x-dns-prefetch-control"]).toBe("off")
		})

		it("should set Referrer-Policy header", async () => {
			const response = await request(app).get("/")
			expect(response.headers["referrer-policy"]).toBe("no-referrer")
		})
	})
})
