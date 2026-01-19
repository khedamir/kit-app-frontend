import { apiClient } from "./client";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    return data;
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const { data } = await apiClient.post<{ access_token: string }>(
      "/auth/refresh"
    );
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
