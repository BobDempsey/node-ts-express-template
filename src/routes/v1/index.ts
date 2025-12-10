import { Router } from "express"
import env from "@/lib/env"
import authRoutes from "./auth.routes"
import exampleRoutes from "./example.routes"

const router = Router()

// Auth routes (only when JWT auth is enabled)
if (env.ENABLE_JWT_AUTH) {
	router.use(authRoutes)
}

// V1 API routes
router.use(exampleRoutes)

// Add more v1 route modules here as needed
// router.use('/users', userRoutes)
// router.use('/posts', postRoutes)

export default router
