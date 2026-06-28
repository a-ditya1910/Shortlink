import { Request, Response, NextFunction } from "express"
import pool from "../db/connection"
import { AppError } from "../middleware/errorHandler"

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const linkId = parseInt(req.params.id)

    // verify this link exists and belongs to the logged-in user
    const [linkRows] = await pool.query(
      "SELECT id, short_code, original_url FROM links WHERE id = ? AND user_id = ?",
      [linkId, req.userId]
    )
    const links = linkRows as any[]

    if (links.length === 0) {
      throw new AppError("link not found", 404)
    }

    const link = links[0]

    // total clicks
    const [totalRows] = await pool.query(
      "SELECT COUNT(*) as total FROM clicks WHERE link_id = ?",
      [linkId]
    )
    const total = (totalRows as any[])[0].total

    // clicks per day — last 30 days
    const [byDayRows] = await pool.query(
      `SELECT DATE(clicked_at) as day, COUNT(*) as clicks
       FROM clicks
       WHERE link_id = ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(clicked_at)
       ORDER BY day ASC`,
      [linkId]
    )

    // clicks by device
    const [byDeviceRows] = await pool.query(
      `SELECT COALESCE(device, 'unknown') as device, COUNT(*) as clicks
       FROM clicks WHERE link_id = ?
       GROUP BY device`,
      [linkId]
    )

    // top 5 countries
    const [byCountryRows] = await pool.query(
      `SELECT COALESCE(country, 'unknown') as country, COUNT(*) as clicks
       FROM clicks WHERE link_id = ?
       GROUP BY country
       ORDER BY clicks DESC
       LIMIT 5`,
      [linkId]
    )

    // convert device/country rows into plain objects
    const byDevice: Record<string, number> = {}
    for (const row of byDeviceRows as any[]) {
      byDevice[row.device] = Number(row.clicks)
    }

    const byCountry: Record<string, number> = {}
    for (const row of byCountryRows as any[]) {
      byCountry[row.country] = Number(row.clicks)
    }

    res.json({
      linkId: link.id,
      shortCode: link.short_code,
      originalUrl: link.original_url,
      totalClicks: Number(total),
      byDay: (byDayRows as any[]).map((r) => ({
        day: r.day,
        clicks: Number(r.clicks),
      })),
      byDevice,
      byCountry,
    })
  } catch (err) {
    next(err)
  }
}
