import { Request, Response, NextFunction } from "express"
import pool from "../db/connection"
import { encode } from "../utils/base62"
import { AppError } from "../middleware/errorHandler"
import { deleteCachedLink } from "../redis/cache"
import env from "../config/env"

export async function createLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body
    const userId = req.userId!

    if (!originalUrl) {
      throw new AppError("originalUrl is required", 400)
    }

    try {
      new URL(originalUrl)
    } catch {
      throw new AppError("originalUrl must be a valid URL", 400)
    }

    if (customAlias) {
      const [rows] = await pool.query(
        "SELECT id FROM links WHERE short_code = ? OR custom_alias = ?",
        [customAlias, customAlias]
      )
      if ((rows as any[]).length > 0) {
        throw new AppError(`'${customAlias}' is already taken`, 409)
      }
    }

    const expiry = expiresAt ? new Date(expiresAt) : null

    // insert first with null short_code to get the auto-increment id
    const [result] = await pool.query(
      "INSERT INTO links (user_id, original_url, custom_alias, expires_at) VALUES (?, ?, ?, ?)",
      [userId, originalUrl, customAlias || null, expiry]
    ) as any

    const insertId = result.insertId
    const shortCode = customAlias || encode(insertId)

    await pool.query("UPDATE links SET short_code = ? WHERE id = ?", [shortCode, insertId])

    res.status(201).json({
      id: insertId,
      shortCode,
      originalUrl,
      customAlias: customAlias || null,
      expiresAt: expiry,
      shortUrl: `${env.appUrl}/${shortCode}`,
    })
  } catch (err) {
    next(err)
  }
}

export async function getLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.short_code, l.original_url, l.custom_alias, l.expires_at, l.created_at,
              COUNT(c.id) as total_clicks
       FROM links l
       LEFT JOIN clicks c ON c.link_id = l.id
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.userId]
    )

    const links = (rows as any[]).map((l) => ({
      id: l.id,
      shortCode: l.short_code,
      originalUrl: l.original_url,
      customAlias: l.custom_alias,
      expiresAt: l.expires_at,
      createdAt: l.created_at,
      totalClicks: Number(l.total_clicks),
      shortUrl: `${env.appUrl}/${l.short_code}`,
    }))

    res.json({ links })
  } catch (err) {
    next(err)
  }
}

export async function updateExpiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { expiresAt } = req.body

    const [rows] = await pool.query(
      "SELECT user_id, short_code FROM links WHERE id = ?",
      [id]
    )
    const links = rows as any[]

    if (links.length === 0) throw new AppError("link not found", 404)
    if (links[0].user_id !== req.userId) throw new AppError("forbidden", 403)

    // null means remove expiry (link lives forever), otherwise set the new date
    const expiry = expiresAt ? new Date(expiresAt) : null

    await pool.query("UPDATE links SET expires_at = ? WHERE id = ?", [expiry, id])

    // must invalidate redis — old cache has wrong TTL, next redirect will re-cache correctly
    await deleteCachedLink(links[0].short_code)

    res.json({ message: "expiry updated", expiresAt: expiry })
  } catch (err) {
    next(err)
  }
}

export async function deleteLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      "SELECT user_id, short_code FROM links WHERE id = ?",
      [id]
    )
    const links = rows as any[]

    if (links.length === 0) {
      throw new AppError("link not found", 404)
    }

    if (links[0].user_id !== req.userId) {
      throw new AppError("forbidden", 403)
    }

    await pool.query("DELETE FROM links WHERE id = ?", [id])
    await deleteCachedLink(links[0].short_code) // clear from redis too

    res.json({ message: "link deleted" })
  } catch (err) {
    next(err)
  }
}
