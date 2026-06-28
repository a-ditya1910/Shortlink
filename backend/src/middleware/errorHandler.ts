import { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message)
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  console.error("unexpected error:", err)
  res.status(500).json({ error: "something went wrong" })
}
