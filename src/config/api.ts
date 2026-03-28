/**
 * Должен совпадать с baseURL axios.
 * Абсолютный URL — фронт и API на разных доменах (укажите прод-URL при сборке).
 * Путь с "/" — один домен: nginx или Vite proxy проксирует /api на бэкенд; в бандл не попадает localhost.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api/v1";

/** Пустая строка: для <img src> используем только путь от корня сайта. */
export function apiOriginForUploads(): string {
  if (API_BASE_URL.startsWith("/")) {
    return "";
  }
  return API_BASE_URL.replace(/\/api\/v1\/?$/i, "");
}
