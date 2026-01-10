import { apiClient } from "./client";
import type { AuthResponse, LoginCredentials, User } from "@/types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
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
