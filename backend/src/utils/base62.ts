const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

// converts a mysql auto-increment id into a short Base62 string
// id=1 → "1", id=62 → "10", id=3844 → "100"  (collision-free because ids are unique)
export function encode(id: number): string {
  if (id === 0) return CHARS[0]
  let result = ""
  while (id > 0) {
    result = CHARS[id % 62] + result
    id = Math.floor(id / 62)
  }
  return result
}
