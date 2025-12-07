import { type Request, type Response, Router } from "express"

const router = Router()

/**
 * GET /health
 * Basic health check - always returns 200 if the service is running
 */
router.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString()
	})
})

/**
 * GET /ready
 * Readiness check - verifies if the service is ready to accept requests
 * In a real application, this would check database connections, external services, etc.
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
 * GET /live
 * Liveness check - verifies if the service is alive and should not be restarted
 * Used by Kubernetes and other orchestrators to determine if a pod should be restarted
 */
router.get("/live", (_req: Request, res: Response) => {
	// If we can respond, we're alive
	res.status(200).json({
		status: "alive",
		timestamp: new Date().toISOString()
	})
})

export default router
