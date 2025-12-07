import { Router } from "express"
import healthRoutes from "./health.routes"

const router = Router()

// Health check routes (not versioned, always available at root)
router.use(healthRoutes)

export default router
