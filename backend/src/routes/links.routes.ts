import { Router } from "express"
import { createLink, getLinks, deleteLink, updateExpiry } from "../controllers/links.controller"
import { getAnalytics } from "../controllers/analytics.controller"
import { authMiddleware } from "../middleware/auth"
import { rateLimit } from "../middleware/rateLimit"

const router = Router()

router.use(authMiddleware)

router.post("/", rateLimit(10), createLink)   // 10/min — stop link spam
router.get("/", getLinks)
router.get("/:id/analytics", getAnalytics)
router.patch("/:id/expiry", updateExpiry)
router.delete("/:id", deleteLink)

export default router
