/**
 * Unit Tests for async-handler.ts
 *
 * Test Coverage Plan:
 * 1. Basic Functionality
 *    - Verify it wraps async functions properly
 *    - Verify successful async operations complete normally
 *    - Verify response is returned correctly
 *
 * 2. Error Handling
 *    - Verify it catches async errors (rejected promises)
 *    - Verify it passes errors to next() middleware
 *    - Verify it handles synchronous errors thrown in async functions
 *    - Verify it handles errors from nested promises
 *
 * 3. Express Integration
 *    - Verify it returns a proper Express RequestHandler
 *    - Verify it receives req, res, next parameters correctly
 *    - Verify it preserves function execution context
 *
 * 4. Edge Cases
 *    - Verify it handles void return type
 *    - Verify it handles Response return type
 *    - Verify multiple error handling calls
 *    - Verify it doesn't swallow errors
 */

import type { NextFunction, Request, Response } from "express"
import { asyncHandler } from "@/utils/async-handler"

describe("async-handler.ts", () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let mockNext: jest.MockedFunction<NextFunction>

	beforeEach(() => {
		mockReq = {}
		mockRes = {
			json: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis()
		}
		mockNext = jest.fn()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("Basic Functionality", () => {
		it("should wrap an async function and execute it successfully", async () => {
			const asyncFn = async (_req: Request, res: Response) => {
				res.json({ success: true })
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			// Wait for async operation to complete
			await new Promise(process.nextTick)

			expect(mockRes.json).toHaveBeenCalledWith({ success: true })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it("should pass request, response, and next to the wrapped function", async () => {
			const asyncFn = jest.fn(
				async (req: Request, res: Response, next: NextFunction) => {
					expect(req).toBe(mockReq)
					expect(res).toBe(mockRes)
					expect(next).toBe(mockNext)
				}
			)

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(asyncFn).toHaveBeenCalledTimes(1)
			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext)
		})

		it("should return void (Express RequestHandler return type)", () => {
			const asyncFn = async (_req: Request, res: Response) => {
				res.json({ test: true })
			}

			const wrappedFn = asyncHandler(asyncFn)
			const result = wrappedFn(
				mockReq as Request,
				mockRes as Response,
				mockNext
			)

			expect(result).toBeUndefined()
		})
	})

	describe("Error Handling", () => {
		it("should catch async errors and pass them to next()", async () => {
			const testError = new Error("Async operation failed")
			const asyncFn = async () => {
				throw testError
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			// Wait for promise rejection to be caught
			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith(testError)
		})

		it("should catch rejected promises and pass them to next()", async () => {
			const testError = new Error("Promise rejected")
			const asyncFn = async () => {
				return Promise.reject(testError)
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith(testError)
		})

		it("should catch synchronous errors thrown in async functions", async () => {
			const testError = new Error("Synchronous error in async function")
			const asyncFn = async () => {
				// Synchronous throw inside async function
				throw testError
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith(testError)
		})

		it("should handle errors from nested promise chains", async () => {
			const testError = new Error("Nested promise error")
			const asyncFn = async () => {
				await Promise.resolve()
					.then(() => Promise.resolve())
					.then(() => {
						throw testError
					})
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith(testError)
		})

		it("should not swallow errors", async () => {
			const testError = new Error("Error should be passed to next")
			const asyncFn = async () => {
				throw testError
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			// Verify error is passed exactly as thrown
			expect(mockNext).toHaveBeenCalledWith(testError)
			expect(mockRes.json).not.toHaveBeenCalled()
			expect(mockRes.send).not.toHaveBeenCalled()
		})
	})

	describe("Express Integration", () => {
		it("should work with Express route handlers that return Response", async () => {
			const asyncFn = async (_req: Request, res: Response) => {
				return res.status(200).json({ data: "test" })
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockRes.status).toHaveBeenCalledWith(200)
			expect(mockRes.json).toHaveBeenCalledWith({ data: "test" })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it("should work with Express route handlers that return void", async () => {
			const asyncFn = async (_req: Request, res: Response) => {
				res.send("OK")
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockRes.send).toHaveBeenCalledWith("OK")
			expect(mockNext).not.toHaveBeenCalled()
		})

		it("should preserve request data passed to the handler", async () => {
			mockReq.params = { id: "123" }
			mockReq.body = { name: "test" }
			mockReq.query = { filter: "active" }

			const asyncFn = async (req: Request, res: Response) => {
				expect(req.params).toEqual({ id: "123" })
				expect(req.body).toEqual({ name: "test" })
				expect(req.query).toEqual({ filter: "active" })
				res.json({ received: true })
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockRes.json).toHaveBeenCalledWith({ received: true })
		})
	})

	describe("Edge Cases", () => {
		it("should handle async functions that call next() explicitly", async () => {
			const asyncFn = async (
				_req: Request,
				_res: Response,
				next: NextFunction
			) => {
				// Simulate middleware that calls next() for route continuation
				next()
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith()
		})

		it("should handle multiple sequential calls", async () => {
			let callCount = 0
			const asyncFn = async (_req: Request, res: Response) => {
				callCount++
				res.json({ count: callCount })
			}

			const wrappedFn = asyncHandler(asyncFn)

			wrappedFn(mockReq as Request, mockRes as Response, mockNext)
			await new Promise(process.nextTick)

			wrappedFn(mockReq as Request, mockRes as Response, mockNext)
			await new Promise(process.nextTick)

			expect(callCount).toBe(2)
			expect(mockNext).not.toHaveBeenCalled()
		})

		it("should handle async functions with delayed operations", async () => {
			const asyncFn = async (_req: Request, res: Response) => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				res.json({ delayed: true })
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			// Wait for the delayed operation
			await new Promise((resolve) => setTimeout(resolve, 20))

			expect(mockRes.json).toHaveBeenCalledWith({ delayed: true })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it("should handle errors with custom error objects", async () => {
			class CustomError extends Error {
				statusCode = 400
				code = "CUSTOM_ERROR"
			}

			const customError = new CustomError("Custom error message")
			const asyncFn = async () => {
				throw customError
			}

			const wrappedFn = asyncHandler(asyncFn)
			wrappedFn(mockReq as Request, mockRes as Response, mockNext)

			await new Promise(process.nextTick)

			expect(mockNext).toHaveBeenCalledTimes(1)
			expect(mockNext).toHaveBeenCalledWith(customError)
			const passedError = mockNext.mock.calls[0]?.[0] as unknown as CustomError
			expect(passedError).toBeInstanceOf(CustomError)
			expect(passedError.statusCode).toBe(400)
			expect(passedError.code).toBe("CUSTOM_ERROR")
		})
	})
})
