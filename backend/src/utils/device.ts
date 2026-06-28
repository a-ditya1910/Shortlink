export function getDevice(userAgent: string = ""): string {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet/.test(ua)) return "tablet"
  // android tablets have "android" in UA but NOT "mobile" — phones have both
  if (/android/.test(ua) && !/mobile/.test(ua)) return "tablet"
  if (/mobile|iphone|ipod|android/.test(ua)) return "mobile"
  return "desktop"
}
