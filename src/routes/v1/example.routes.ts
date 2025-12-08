import { type Request, type Response, Router } from "express"
import { GREETING } from "@/lib/constants"
import { asyncHandler } from "@/utils"

const router = Router()

/**
 * GET /api/v1/
 * Example root endpoint - returns a greeting message
 */
router.get("/", (_req: Request, res: Response) => {
	res.send(GREETING)
})

/**
 * GET /api/v1/example
 * Example endpoint demonstrating a simple JSON response
 */
router.get("/example", (_req: Request, res: Response) => {
	res.json({
		message: "This is an example endpoint",
		version: "v1",
		timestamp: new Date().toISOString()
	})
})

/**
 * GET /api/v1/async-example
 * Example endpoint demonstrating async handler usage
 * This shows how to wrap async route handlers to automatically catch errors
 */
router.get(
	"/async-example",
	asyncHandler(async (_req: Request, res: Response) => {
		// Simulate an async operation (e.g., database query, API call)
		const data = await Promise.resolve({
			message: "This is an async endpoint example",
			version: "v1",
			timestamp: new Date().toISOString(),
			description: "Wrapped with asyncHandler to catch promise rejections"
		})

		res.json(data)
	})
)

/**
 * GET /api/v1/async-error-example
 * Example endpoint demonstrating async error handling
 * This shows how asyncHandler catches errors and passes them to error middleware
 */
router.get(
	"/async-error-example",
	asyncHandler(async (_req: Request, _res: Response) => {
		// Simulate an async operation that throws an error
		await Promise.resolve()

		// This error will be caught by asyncHandler and passed to error middleware
		throw new Error("Example async error - caught by asyncHandler")
	})
)

export default router
