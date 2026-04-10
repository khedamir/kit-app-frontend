import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/api";
import { useAuthStore } from "@/store/auth";

export const notificationsKeys = {
  all: ["notifications"] as const,
  my: () => [...notificationsKeys.all, "my"] as const,
};

export function useMyNotifications(page = 1, perPage = 20) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: [...notificationsKeys.my(), userId, page, perPage],
    queryFn: () => notificationsApi.getMy(page, perPage),
    enabled: Boolean(userId),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.my() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.my() });
    },
  });
}
