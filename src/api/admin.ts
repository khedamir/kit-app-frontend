import { apiClient } from "./client";
import type { AdminProfile, AdminProfileUpdate } from "@/types";

export const adminApi = {
  getProfile: async (): Promise<AdminProfile> => {
    const { data } = await apiClient.get<AdminProfile>("/admins/me");
    return data;
  },

  updateProfile: async (update: AdminProfileUpdate): Promise<AdminProfile> => {
    const { data } = await apiClient.patch<AdminProfile>("/admins/me", update);
    return data;
  },
};

