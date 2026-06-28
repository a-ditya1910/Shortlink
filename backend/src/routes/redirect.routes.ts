import { Router } from "express"
import { redirect } from "../controllers/redirect.controller"
import { rateLimit } from "../middleware/rateLimit"

const router = Router()

router.get("/:shortCode", rateLimit(60), redirect)  // 60/min — generous for shared links

export default router
