import redis from "./client"

export async function isRateLimited(ip: string, limit: number, windowSecs = 60): Promise<boolean> {
  // each minute gets its own key — auto-expires after the window
  const bucket = Math.floor(Date.now() / (windowSecs * 1000))
  const key = `rl:${ip}:${bucket}`

  const count = await redis.incr(key) // atomic — no race condition even with concurrent requests
  if (count === 1) {
    await redis.expire(key, windowSecs) // first request sets the TTL
  }

  return count > limit
}
