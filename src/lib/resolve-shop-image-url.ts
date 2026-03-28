import { apiOriginForUploads } from "@/config/api";

const UPLOAD_PATH_PREFIX = "/api/v1/uploads/";

/**
 * URL для <img src>. Путь с бэкенда — относительный `/api/v1/uploads/...`.
 * Если VITE_API_URL — путь вида `/api/v1`, возвращаем тот же путь (тот же хост, что у страницы).
 * Если абсолютный URL API — подставляем его origin, чтобы не зашивать localhost в прод.
 */
export function resolveShopImageUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  const path = url.trim();
  if (!path.startsWith(UPLOAD_PATH_PREFIX)) return null;
  const origin = apiOriginForUploads();
  return origin ? `${origin}${path}` : path;
}
