import redis from "./client"

const DEFAULT_TTL = 3600 // 1 hour

// storing url + linkId together so we can record clicks on cache hits too
// without making an extra DB call just to get the id

export async function getCachedLink(shortCode: string) {
  const val = await redis.get(`link:${shortCode}`)
  if (!val) return null
  return JSON.parse(val) as { url: string; linkId: number }
}

export async function setCachedLink(
  shortCode: string,
  url: string,
  linkId: number,
  ttl = DEFAULT_TTL
) {
  await redis.setex(`link:${shortCode}`, ttl, JSON.stringify({ url, linkId }))
}

export async function deleteCachedLink(shortCode: string) {
  await redis.del(`link:${shortCode}`)
}
