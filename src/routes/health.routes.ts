import { type Request, type Response, Router } from "express"

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
	res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString()
	})
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
		res.status(200).json({
			status: "ready",
			timestamp: new Date().toISOString()
		})
	} else {
		res.status(503).json({
			status: "not ready",
			timestamp: new Date().toISOString()
		})
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
	res.status(200).json({
		status: "alive",
		timestamp: new Date().toISOString()
	})
})

export default router
