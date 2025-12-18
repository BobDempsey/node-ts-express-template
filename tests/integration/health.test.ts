import request from "supertest"
import { app } from "@/app"
import server from "@/index"
import { resetReadinessCheck, setReadinessCheck } from "@/routes/health.routes"

describe("Health Check Endpoints Integration Tests", () => {
	afterAll((done) => {
		server.close(done)
	})

	afterEach(() => {
		// Reset readiness check after each test
		resetReadinessCheck()
	})

	describe("GET /health", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/health")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(app).get("/health")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return status ok in data envelope", async () => {
			const response = await request(app).get("/health")
			expect(response.body).toHaveProperty("success", true)
			expect(response.body).toHaveProperty("data")
			expect(response.body.data).toHaveProperty("status", "ok")
		})

		it("should include timestamp in meta", async () => {
			const response = await request(app).get("/health")
			expect(response.body).toHaveProperty("meta")
			expect(response.body.meta).toHaveProperty("timestamp")
			expect(
				new Date(response.body.meta.timestamp).getTime()
			).toBeLessThanOrEqual(Date.now())
		})

		it("should handle multiple concurrent requests", async () => {
			const responses = await Promise.all([
				request(app).get("/health"),
				request(app).get("/health"),
				request(app).get("/health"),
				request(app).get("/health"),
				request(app).get("/health")
			])

			for (const response of responses) {
				expect(response.status).toBe(200)
				expect(response.body.data.status).toBe("ok")
			}
		})

		it("should respond within reasonable time", async () => {
			const startTime = Date.now()
			await request(app).get("/health")
			const responseTime = Date.now() - startTime
			expect(responseTime).toBeLessThan(100)
		})
	})

	describe("GET /ready", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/ready")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(app).get("/ready")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return status ready in data envelope", async () => {
			const response = await request(app).get("/ready")
			expect(response.body).toHaveProperty("success", true)
			expect(response.body.data).toHaveProperty("status", "ready")
		})

		it("should include timestamp in meta", async () => {
			const response = await request(app).get("/ready")
			expect(response.body).toHaveProperty("meta")
			expect(response.body.meta).toHaveProperty("timestamp")
			expect(
				new Date(response.body.meta.timestamp).getTime()
			).toBeLessThanOrEqual(Date.now())
		})

		it("should handle multiple concurrent requests", async () => {
			const responses = await Promise.all([
				request(app).get("/ready"),
				request(app).get("/ready"),
				request(app).get("/ready")
			])

			for (const response of responses) {
				expect(response.status).toBe(200)
				expect(response.body.data.status).toBe("ready")
			}
		})

		it("should return 503 when service is not ready", async () => {
			// Override readiness check to return false
			setReadinessCheck(() => false)

			const response = await request(app).get("/ready")

			expect(response.status).toBe(503)
			expect(response.body).toHaveProperty("success", false)
			expect(response.body).toHaveProperty("error")
			expect(response.body.error).toHaveProperty("message", "Service not ready")
			expect(response.body.error).toHaveProperty("code", "SERVICE_NOT_READY")
		})

		it("should return correct error structure when not ready", async () => {
			setReadinessCheck(() => false)

			const response = await request(app).get("/ready")

			expect(response.status).toBe(503)
			expect(response.headers["content-type"]).toMatch(/application\/json/)
			expect(response.body.error).toHaveProperty("statusCode", 503)
		})
	})

	describe("GET /live", () => {
		it("should respond with 200 status", async () => {
			const response = await request(app).get("/live")
			expect(response.status).toBe(200)
		})

		it("should return correct content type", async () => {
			const response = await request(app).get("/live")
			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})

		it("should return status alive in data envelope", async () => {
			const response = await request(app).get("/live")
			expect(response.body).toHaveProperty("success", true)
			expect(response.body.data).toHaveProperty("status", "alive")
		})

		it("should include timestamp in meta", async () => {
			const response = await request(app).get("/live")
			expect(response.body).toHaveProperty("meta")
			expect(response.body.meta).toHaveProperty("timestamp")
			expect(
				new Date(response.body.meta.timestamp).getTime()
			).toBeLessThanOrEqual(Date.now())
		})

		it("should handle rapid successive requests", async () => {
			const responses = []

			for (let i = 0; i < 10; i++) {
				const response = await request(app).get("/live")
				responses.push(response)
			}

			for (const response of responses) {
				expect(response.status).toBe(200)
				expect(response.body.data.status).toBe("alive")
			}
		})
	})

	describe("Health Endpoints HTTP Methods", () => {
		it("should only respond to GET requests on /health", async () => {
			const postResponse = await request(app).post("/health")
			expect(postResponse.status).toBe(404)

			const putResponse = await request(app).put("/health")
			expect(putResponse.status).toBe(404)

			const deleteResponse = await request(app).delete("/health")
			expect(deleteResponse.status).toBe(404)
		})

		it("should only respond to GET requests on /ready", async () => {
			const postResponse = await request(app).post("/ready")
			expect(postResponse.status).toBe(404)
		})

		it("should only respond to GET requests on /live", async () => {
			const postResponse = await request(app).post("/live")
			expect(postResponse.status).toBe(404)
		})
	})

	describe("All Health Endpoints Together", () => {
		it("should all return 200 when checked together", async () => {
			const [healthRes, readyRes, liveRes] = await Promise.all([
				request(app).get("/health"),
				request(app).get("/ready"),
				request(app).get("/live")
			])

			expect(healthRes.status).toBe(200)
			expect(readyRes.status).toBe(200)
			expect(liveRes.status).toBe(200)
		})
	})
})
