import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import type { AdminProfileUpdate } from "@/types";

export const adminKeys = {
  all: ["admin"] as const,
  profile: () => [...adminKeys.all, "profile"] as const,
};

export function useAdminProfile() {
  return useQuery({
    queryKey: adminKeys.profile(),
    queryFn: adminApi.getProfile,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminProfileUpdate) => adminApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile() });
    },
  });
}

