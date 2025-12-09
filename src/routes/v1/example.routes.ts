import { type Request, type Response, Router } from "express"
import { GREETING } from "@/lib/constants"
import { asyncHandler } from "@/utils"

const router = Router()

/**
 * @openapi
 * /api/v1/:
 *   get:
 *     tags:
 *       - Example
 *     summary: Root endpoint
 *     description: Returns a greeting message
 *     responses:
 *       200:
 *         description: Greeting message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello, world!
 */
router.get("/", (_req: Request, res: Response) => {
	res.send(GREETING)
})

/**
 * @openapi
 * /api/v1/example:
 *   get:
 *     tags:
 *       - Example
 *     summary: Example endpoint
 *     description: Demonstrates a simple JSON response
 *     responses:
 *       200:
 *         description: Example JSON response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is an example endpoint
 *                 version:
 *                   type: string
 *                   example: v1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/example", (_req: Request, res: Response) => {
	res.json({
		message: "This is an example endpoint",
		version: "v1",
		timestamp: new Date().toISOString()
	})
})

/**
 * @openapi
 * /api/v1/async-example:
 *   get:
 *     tags:
 *       - Example
 *     summary: Async example endpoint
 *     description: Demonstrates async handler usage with automatic error catching
 *     responses:
 *       200:
 *         description: Async JSON response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is an async endpoint example
 *                 version:
 *                   type: string
 *                   example: v1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 description:
 *                   type: string
 *                   example: Wrapped with asyncHandler to catch promise rejections
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
 * @openapi
 * /api/v1/async-error-example:
 *   get:
 *     tags:
 *       - Example
 *     summary: Async error example
 *     description: Demonstrates async error handling - always throws an error to show error middleware in action
 *     responses:
 *       500:
 *         description: Internal server error (intentional for demonstration)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Example async error - caught by asyncHandler
 *                 statusCode:
 *                   type: integer
 *                   example: 500
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
