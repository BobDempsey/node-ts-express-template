import { Router } from "express"
import healthRoutes from "./health.routes"
import v1Routes from "./v1"

const router = Router()

// Health check routes (not versioned, always available at root)
router.use(healthRoutes)

// API v1 routes
router.use("/api/v1", v1Routes)

// Future API versions can be added here
// router.use("/api/v2", v2Routes)

export default router
