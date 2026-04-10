import { apiClient } from "./client";
import type { NotificationsResponse, NotificationItem } from "@/types";

export const notificationsApi = {
  async getMy(page = 1, perPage = 20): Promise<NotificationsResponse> {
    const { data } = await apiClient.get<NotificationsResponse>("/notifications/me", {
      params: { page, per_page: perPage },
    });
    return data;
  },

  async markAsRead(notificationId: number): Promise<NotificationItem> {
    const { data } = await apiClient.patch<NotificationItem>(
      `/notifications/me/${notificationId}/read`
    );
    return data;
  },

  async markAllAsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>(
      "/notifications/me/read-all"
    );
    return data;
  },
};
