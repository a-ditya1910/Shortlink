import { Request, Response, NextFunction } from "express"
import pool from "../db/connection"
import { hashPassword, comparePassword } from "../utils/password"
import { signToken } from "../utils/jwt"
import { AppError } from "../middleware/errorHandler"
import { UserRow } from "../types"

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError("email and password are required", 400)
    }

    if (password.length < 6) {
      throw new AppError("password must be at least 6 characters", 400)
    }

    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email])
    if ((rows as UserRow[]).length > 0) {
      throw new AppError("email already in use", 409)
    }

    const hashed = await hashPassword(password)
    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashed])

    res.status(201).json({ message: "registered successfully" })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError("email and password are required", 400)
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
    const users = rows as UserRow[]

    if (users.length === 0) {
      throw new AppError("invalid email or password", 401)
    }

    const user = users[0]
    const match = await comparePassword(password, user.password)

    if (!match) {
      throw new AppError("invalid email or password", 401)
    }

    const token = signToken({ userId: user.id, email: user.email })

    res.json({
      token,
      user: { id: user.id, email: user.email },
    })
  } catch (err) {
    next(err)
  }
}
