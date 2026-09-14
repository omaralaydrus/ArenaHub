export const ALLOWED_PATHS = new Set([
  "ping",
  "zones",
  "license-types",
  "business-activities",
  "statistics",
]);
export function sandboxQuery(incoming: URLSearchParams) {
  const forwarded = new URLSearchParams();
  for (const key of ["offset", "limit"] as const) {
    const value = incoming.get(key);
    if (value === null) continue;
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
      throw new Error(`${key} must be a non-negative whole number.`);
    const number = Number(value);
    if (key === "limit" && number < 1)
      throw new Error("limit must be at least 1.");
    forwarded.set(
      key,
      String(key === "limit" ? Math.min(number, 200) : number),
    );
  }
  return forwarded.size ? `?${forwarded}` : "";
}
