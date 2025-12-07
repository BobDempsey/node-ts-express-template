import { type Request, type Response, Router } from "express"
import { GREETING } from "@/lib/constants"

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

export default router
