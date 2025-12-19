import { Router } from "express"
import { asyncHandler } from "@/utils"
import {
	getAsyncErrorExample,
	getAsyncExample,
	getExample,
	getRoot
} from "./controllers/example.controller"

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
router.get("/", getRoot)

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
router.get("/example", getExample)

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
router.get("/async-example", asyncHandler(getAsyncExample))

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
router.get("/async-error-example", asyncHandler(getAsyncErrorExample))

export default router
