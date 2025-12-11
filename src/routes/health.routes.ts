import { type Request, type Response, Router } from "express"
import { sendError, sendSuccess } from "@/utils"

const router = Router()

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Basic health check
 *     description: Returns 200 if the service is running
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/health", (_req: Request, res: Response) => {
	sendSuccess(res, { status: "ok" })
})

/**
 * @openapi
 * /ready:
 *   get:
 *     tags:
 *       - Health
 *     summary: Readiness check
 *     description: Verifies if the service is ready to accept requests. Checks database connections, external services, etc.
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/ready", (_req: Request, res: Response) => {
	// TODO: Add actual dependency checks when needed
	// For now, if the server is running, it's ready
	const isReady = true

	if (isReady) {
		sendSuccess(res, { status: "ready" })
	} else {
		sendError(res, "Service not ready", "SERVICE_NOT_READY", 503)
	}
})

/**
 * @openapi
 * /live:
 *   get:
 *     tags:
 *       - Health
 *     summary: Liveness check
 *     description: Verifies if the service is alive. Used by Kubernetes to determine if a pod should be restarted.
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/live", (_req: Request, res: Response) => {
	// If we can respond, we're alive
	sendSuccess(res, { status: "alive" })
})

export default router
