// Turn a hotel name into a URL-safe slug, e.g. "The Oberoi Grand" -> "the-oberoi-grand".
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
