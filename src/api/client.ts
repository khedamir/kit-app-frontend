import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { handleError } from "@/lib/error-handler";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor для добавления токена
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor для обработки ошибок и refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Если 401 и это не повторный запрос и не запрос на login/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - очищаем токены
          handleError(refreshError, "apiClient.refreshToken");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        // Нет refresh token - редирект на логин
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    // Обработка других ошибок
    if (error.response) {
      // Сервер вернул ошибку
      const status = error.response.status;
      if (status >= 500) {
        handleError(error, "apiClient.serverError");
      } else if (status === 404) {
        handleError(error, "apiClient.notFound");
      }
    } else if (error.request) {
      // Запрос отправлен, но ответа нет
      handleError(error, "apiClient.networkError");
    } else {
      // Ошибка при настройке запроса
      handleError(error, "apiClient.requestError");
    }

    return Promise.reject(error);
  }
);
