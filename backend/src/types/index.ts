export interface JwtPayload {
  userId: number
  email: string
}

export interface UserRow {
  id: number
  email: string
  password: string
  created_at: Date
}

export interface LinkRow {
  id: number
  user_id: number
  short_code: string | null
  original_url: string
  custom_alias: string | null
  expires_at: Date | null
  created_at: Date
}

export interface ClickRow {
  id: number
  link_id: number
  ip: string | null
  device: string | null
  country: string | null
  clicked_at: Date
}

// extends express Request so req.userId is available after JWT middleware
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}
