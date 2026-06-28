import jwt from "jsonwebtoken"
import env from "../config/env"
import { JwtPayload } from "../types"

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload
}
