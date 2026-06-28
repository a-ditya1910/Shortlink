import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "no token provided" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: "invalid or expired token" })
  }
}
