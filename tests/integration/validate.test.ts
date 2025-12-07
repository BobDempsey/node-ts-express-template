/**
 * Integration Tests for Validate Middleware
 *
 * Test Coverage Plan:
 * 1. Body Validation Integration
 *    - Should validate POST request body
 *    - Should return 400 for invalid body
 *    - Should pass valid requests through
 *
 * 2. Params Validation Integration
 *    - Should validate URL parameters
 *    - Should return 400 for invalid params
 *
 * 3. Query Validation Integration
 *    - Should validate query strings
 *    - Should return 400 for invalid query
 *    - Should handle optional query params
 *
 * 4. End-to-End Flow
 *    - Should integrate with error handler
 *    - Should return formatted validation errors
 *    - Should work with complex schemas
 */

import express, { type Request, type Response } from "express"
import request from "supertest"
import { z } from "zod"
import { errorHandler, validate } from "@/middleware"

describe("Validate Middleware Integration", () => {
	let testApp: express.Application

	beforeEach(() => {
		// Create a fresh Express app for each test
		testApp = express()
		testApp.use(express.json())
	})

	describe("Body Validation Integration", () => {
		it("should validate POST request body successfully", async () => {
			const createUserSchema = z.object({
				name: z.string().min(1),
				email: z.string().email()
			})

			testApp.post(
				"/users",
				validate(createUserSchema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ user: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({
				name: "John Doe",
				email: "john@example.com"
			})

			expect(response.status).toBe(201)
			expect(response.body.user).toEqual({
				name: "John Doe",
				email: "john@example.com"
			})
		})

		it("should return 400 for invalid body", async () => {
			const createUserSchema = z.object({
				name: z.string().min(1),
				email: z.string().email()
			})

			testApp.post(
				"/users",
				validate(createUserSchema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ user: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({
				name: "John",
				email: "invalid-email"
			})

			expect(response.status).toBe(400)
			expect(response.body).toHaveProperty("error")
			expect(response.body).toHaveProperty("code", "VALIDATION_ERROR")
			expect(response.body).toHaveProperty("details")
			expect(response.body.details).toHaveProperty("email")
		})

		it("should return 400 for missing required fields", async () => {
			const schema = z.object({
				name: z.string(),
				email: z.string().email()
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ user: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({
				name: "John"
			})

			expect(response.status).toBe(400)
			expect(response.body.details).toHaveProperty("email")
		})

		it("should apply default values from schema", async () => {
			const schema = z.object({
				name: z.string(),
				active: z.boolean().default(true)
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ user: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({
				name: "John"
			})

			expect(response.status).toBe(201)
			expect(response.body.user.active).toBe(true)
		})

		it("should strip extra fields not in schema", async () => {
			const schema = z.object({
				name: z.string()
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ user: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({
				name: "John",
				extraField: "should be removed"
			})

			expect(response.status).toBe(201)
			expect(response.body.user).toEqual({
				name: "John"
			})
		})
	})

	describe("Params Validation Integration", () => {
		it("should validate URL parameters successfully", async () => {
			const paramsSchema = z.object({
				id: z.coerce.number().positive()
			})

			testApp.get(
				"/users/:id",
				validate(paramsSchema, "params"),
				(req: Request, res: Response) => {
					res.json({ userId: req.params.id })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users/123")

			expect(response.status).toBe(200)
			expect(response.body.userId).toBe(123)
		})

		it("should return 400 for invalid params", async () => {
			const paramsSchema = z.object({
				id: z.string().uuid()
			})

			testApp.get(
				"/users/:id",
				validate(paramsSchema, "params"),
				(req: Request, res: Response) => {
					res.json({ userId: req.params.id })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users/not-a-uuid")

			expect(response.status).toBe(400)
			expect(response.body.code).toBe("VALIDATION_ERROR")
			expect(response.body.details).toHaveProperty("id")
		})

		it("should handle multiple params", async () => {
			const paramsSchema = z.object({
				userId: z.coerce.number(),
				postId: z.coerce.number()
			})

			testApp.get(
				"/users/:userId/posts/:postId",
				validate(paramsSchema, "params"),
				(req: Request, res: Response) => {
					res.json({ params: req.params })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users/1/posts/42")

			expect(response.status).toBe(200)
			expect(response.body.params).toEqual({
				userId: 1,
				postId: 42
			})
		})
	})

	describe("Query Validation Integration", () => {
		it("should validate query strings successfully", async () => {
			const querySchema = z.object({
				page: z.coerce.number().positive(),
				limit: z.coerce.number().positive().max(100)
			})

			testApp.get(
				"/users",
				validate(querySchema, "query"),
				(_req: Request, res: Response) => {
					// Validation passed, return success
					res.json({ success: true })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users?page=2&limit=20")

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
		})

		it("should return 400 for invalid query", async () => {
			const querySchema = z.object({
				page: z.coerce.number().positive()
			})

			testApp.get(
				"/users",
				validate(querySchema, "query"),
				(req: Request, res: Response) => {
					res.json({ query: req.query })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users?page=-1")

			expect(response.status).toBe(400)
			expect(response.body.code).toBe("VALIDATION_ERROR")
		})

		it("should handle optional query parameters", async () => {
			const querySchema = z.object({
				search: z.string().optional(),
				page: z.coerce.number().default(1)
			})

			testApp.get(
				"/users",
				validate(querySchema, "query"),
				(_req: Request, res: Response) => {
					// Validation passed with optional params
					res.json({ success: true })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/users")

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
		})

		it("should handle search query with filters", async () => {
			const querySchema = z.object({
				search: z.string().optional(),
				status: z.enum(["active", "inactive"]).optional(),
				page: z.coerce.number().default(1),
				limit: z.coerce.number().default(10)
			})

			testApp.get(
				"/users",
				validate(querySchema, "query"),
				(_req: Request, res: Response) => {
					// Validation passed with filters
					res.json({ success: true })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get(
				"/users?search=john&status=active&page=2"
			)

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
		})
	})

	describe("Complex Schemas", () => {
		it("should handle nested object validation", async () => {
			const schema = z.object({
				user: z.object({
					name: z.string(),
					email: z.string().email(),
					profile: z.object({
						age: z.number().min(18),
						bio: z.string().optional()
					})
				})
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ data: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.post("/users")
				.send({
					user: {
						name: "John",
						email: "john@example.com",
						profile: {
							age: 25
						}
					}
				})

			expect(response.status).toBe(201)
		})

		it("should handle array validation", async () => {
			const schema = z.object({
				tags: z.array(z.string()).min(1)
			})

			testApp.post(
				"/posts",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ data: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.post("/posts")
				.send({
					tags: ["javascript", "typescript", "node"]
				})

			expect(response.status).toBe(201)
		})

		it("should return detailed errors for nested validation failures", async () => {
			const schema = z.object({
				user: z.object({
					profile: z.object({
						age: z.number().min(18)
					})
				})
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.status(201).json({ data: req.body })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.post("/users")
				.send({
					user: {
						profile: {
							age: 15
						}
					}
				})

			expect(response.status).toBe(400)
			expect(response.body.details).toHaveProperty(["user.profile.age"])
		})
	})

	describe("Multiple Validators", () => {
		it("should handle multiple validation middlewares in sequence", async () => {
			const paramsSchema = z.object({
				id: z.coerce.number()
			})

			const bodySchema = z.object({
				name: z.string()
			})

			testApp.put(
				"/users/:id",
				validate(paramsSchema, "params"),
				validate(bodySchema, "body"),
				(req: Request, res: Response) => {
					res.json({
						id: req.params.id,
						name: req.body.name
					})
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.put("/users/123")
				.send({ name: "John" })

			expect(response.status).toBe(200)
			expect(response.body).toEqual({
				id: 123,
				name: "John"
			})
		})

		it("should fail on first invalid validator", async () => {
			const paramsSchema = z.object({
				id: z.string().uuid()
			})

			const bodySchema = z.object({
				name: z.string()
			})

			testApp.put(
				"/users/:id",
				validate(paramsSchema, "params"),
				validate(bodySchema, "body"),
				(req: Request, res: Response) => {
					res.json({
						id: req.params.id,
						name: req.body.name
					})
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.put("/users/not-uuid")
				.send({ name: "John" })

			expect(response.status).toBe(400)
			expect(response.body.details).toHaveProperty("id")
		})
	})

	describe("Error Response Format", () => {
		it("should integrate with error handler properly", async () => {
			const schema = z.object({
				email: z.string().email()
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.json(req.body)
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.post("/users")
				.send({ email: "invalid" })

			expect(response.status).toBe(400)
			expect(response.body).toMatchObject({
				code: "VALIDATION_ERROR",
				statusCode: 400
			})
			expect(response.body).toHaveProperty("error")
			expect(response.body).toHaveProperty("details")
		})

		it("should return JSON content type for validation errors", async () => {
			const schema = z.object({
				name: z.string()
			})

			testApp.post(
				"/users",
				validate(schema, "body"),
				(req: Request, res: Response) => {
					res.json(req.body)
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).post("/users").send({})

			expect(response.headers["content-type"]).toMatch(/application\/json/)
		})
	})

	describe("Different HTTP Methods", () => {
		it("should work with GET requests", async () => {
			const querySchema = z.object({
				id: z.coerce.number()
			})

			testApp.get(
				"/items",
				validate(querySchema, "query"),
				(req: Request, res: Response) => {
					res.json(req.query)
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).get("/items?id=123")

			expect(response.status).toBe(200)
		})

		it("should work with PUT requests", async () => {
			const bodySchema = z.object({
				name: z.string()
			})

			testApp.put(
				"/items",
				validate(bodySchema, "body"),
				(req: Request, res: Response) => {
					res.json(req.body)
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.put("/items")
				.send({ name: "Test" })

			expect(response.status).toBe(200)
		})

		it("should work with DELETE requests", async () => {
			const paramsSchema = z.object({
				id: z.coerce.number()
			})

			testApp.delete(
				"/items/:id",
				validate(paramsSchema, "params"),
				(req: Request, res: Response) => {
					res.json({ deleted: req.params.id })
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp).delete("/items/123")

			expect(response.status).toBe(200)
		})

		it("should work with PATCH requests", async () => {
			const bodySchema = z.object({
				name: z.string().optional()
			})

			testApp.patch(
				"/items",
				validate(bodySchema, "body"),
				(req: Request, res: Response) => {
					res.json(req.body)
				}
			)
			testApp.use(errorHandler)

			const response = await request(testApp)
				.patch("/items")
				.send({ name: "Updated" })

			expect(response.status).toBe(200)
		})
	})
})
