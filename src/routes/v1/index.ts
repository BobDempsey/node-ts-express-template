import { Router } from "express"
import exampleRoutes from "./example.routes"

const router = Router()

// V1 API routes
router.use(exampleRoutes)

// Add more v1 route modules here as needed
// router.use('/users', userRoutes)
// router.use('/posts', postRoutes)

export default router
