// Generates a Sanity-compatible array item `_key`. Sanity itself just
// requires these be unique strings within their array — it doesn't require
// they come from its own internal generator — so a short random string is
// fine for keys the builder creates client-side (new modules/lessons/
// content blocks/portable text blocks & spans).
export function randomKey(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
