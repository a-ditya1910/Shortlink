import { Request, Response, NextFunction } from "express"
import { isRateLimited } from "../redis/ratelimit"

export function rateLimit(limit: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown"
    const limited = await isRateLimited(ip, limit)
    if (limited) {
      return res.status(429).json({ error: "too many requests, slow down" })
    }
    next()
  }
}
