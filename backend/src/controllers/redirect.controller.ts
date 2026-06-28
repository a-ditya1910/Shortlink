import { Request, Response, NextFunction } from "express"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const geoip = require("geoip-lite")
import pool from "../db/connection"
import { getCachedLink, setCachedLink } from "../redis/cache"
import { getDevice } from "../utils/device"
import { AppError } from "../middleware/errorHandler"
import env from "../config/env"

export async function redirect(req: Request, res: Response, next: NextFunction) {
  try {
    const { shortCode } = req.params

    const cached = await getCachedLink(shortCode)
    if (cached) {
      console.log(`[REDIS HIT] ${shortCode}`)
      recordClick(req, cached.linkId)
      return res.redirect(302, cached.url)
    }

    console.log(`[MYSQL HIT] ${shortCode} — cache miss`)
    // cache miss — go to mysql
    const [rows] = await pool.query(
      "SELECT id, original_url, expires_at FROM links WHERE short_code = ?",
      [shortCode]
    )
    const links = rows as any[]

    if (links.length === 0) {
      throw new AppError("link not found", 404)
    }

    const link = links[0]

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.redirect(`${env.frontendUrl}/expired`)
    }

    // if link has an expiry, don't cache it longer than its remaining life
    let ttl = 3600
    if (link.expires_at) {
      const secondsLeft = Math.floor((new Date(link.expires_at).getTime() - Date.now()) / 1000)
      ttl = Math.min(ttl, secondsLeft)
    }

    await setCachedLink(shortCode, link.original_url, link.id, ttl)

    recordClick(req, link.id) // don't await
    res.redirect(302, link.original_url)
  } catch (err) {
    next(err)
  }
}

// runs in background after redirect is sent — click failure never breaks redirect
async function recordClick(req: Request, linkId: number) {
  try {
    // cf-connecting-ip is set by Cloudflare (Render's edge) — always a clean IPv4, most reliable
    // fallback to req.ip and strip IPv4-mapped IPv6 prefix (::ffff:1.2.3.4 → 1.2.3.4)
    const cfIp = req.headers["cf-connecting-ip"] as string | undefined
    const raw = cfIp || req.ip || null
    const ip = raw?.startsWith("::ffff:") ? raw.slice(7) : raw
    const device = getDevice(req.headers["user-agent"])

    let country: string | null = null
    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      const geo = geoip.lookup(ip)
      country = geo?.country || null
    }

    await pool.query(
      "INSERT INTO clicks (link_id, ip, device, country) VALUES (?, ?, ?, ?)",
      [linkId, ip, device, country]
    )
  } catch (err: any) {
    console.error("click record failed:", err.message)
  }
}
