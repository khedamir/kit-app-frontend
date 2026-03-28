/** Origin API без суффикса /api/v1 */
export function getShopApiOrigin(): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  return base.replace(/\/api\/v1\/?$/, "");
}

const UPLOAD_PATH_PREFIX = "/api/v1/uploads/";

/** Склеивает origin из VITE_API_URL и относительный путь с бэкенда. */
export function resolveShopImageUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  const path = url.trim();
  if (!path.startsWith(UPLOAD_PATH_PREFIX)) return null;
  return `${getShopApiOrigin()}${path}`;
}
