import { Router } from "express"
import { register, login } from "../controllers/auth.controller"
import { rateLimit } from "../middleware/rateLimit"

const router = Router()

router.post("/register", rateLimit(5), register)  // 5/min — stop spam accounts
router.post("/login", rateLimit(5), login)         // 5/min — stop brute force

export default router
