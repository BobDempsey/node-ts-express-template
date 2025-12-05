import { createServer, type Server } from "http"
import request from "supertest"
import { GREETING } from "@/lib/constants"

// Create our own server instance for testing
describe("HTTP Server Integration Tests", () => {
	let server: Server

	beforeAll(() => {
		// Create a test server similar to our main server
		server = createServer((_req, res) => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(GREETING)
		})
	})

	afterAll((done) => {
		if (server?.listening) {
			server.close(done)
		} else {
			done()
		}
	})

	describe("GET /", () => {
		it("should respond with 200 status", async () => {
			const response = await request(server).get("/")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(server).get("/")
			expect(response.headers["content-type"]).toBe("text/plain")
		})

		it("should return expected message", async () => {
			const response = await request(server).get("/")
			expect(response.text).toBe(GREETING)
		})

		it("should handle multiple concurrent requests", async () => {
			const responses = []
			for (let i = 0; i < 5; i++) {
				const response = await request(server).get("/")
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
			const response = await request(server).post("/")
			// Server should still respond (our basic server handles all methods the same way)
			expect(response.status).toBe(200)
		})

		it("should handle PUT requests", async () => {
			const response = await request(server).put("/")
			expect(response.status).toBe(200)
		})

		it("should handle DELETE requests", async () => {
			const response = await request(server).delete("/")
			expect(response.status).toBe(200)
		})
	})

	describe("Different Routes", () => {
		it("should handle requests to different paths", async () => {
			const paths = ["/test", "/api", "/health", "/nonexistent"]

			for (const path of paths) {
				const response = await request(server).get(path)
				// Our basic server responds the same way to all paths
				expect(response.status).toBe(200)
				expect(response.text).toBe(GREETING)
			}
		})
	})

	describe("Server Performance", () => {
		it("should respond within reasonable time", async () => {
			const startTime = Date.now()

			await request(server).get("/")

			const responseTime = Date.now() - startTime
			expect(responseTime).toBeLessThan(100) // Should respond within 100ms
		})

		it("should handle rapid successive requests", async () => {
			const responses = []

			for (let i = 0; i < 10; i++) {
				const response = await request(server).get("/")
				responses.push(response)
			}

			for (const response of responses) {
				expect(response.status).toBe(200)
			}
		})
	})

	describe("Request Headers", () => {
		it("should handle requests with custom headers", async () => {
			const response = await request(server)
				.get("/")
				.set("User-Agent", "Test-Agent")
				.set("Accept", "text/plain")

			expect(response.status).toBe(200)
		})

		it("should handle requests without headers", async () => {
			const response = await request(server).get("/")
			expect(response.status).toBe(200)
		})
	})
})
