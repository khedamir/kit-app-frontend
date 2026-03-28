import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/api/shop";

export const shopKeys = {
  all: ["shop"] as const,
  items: () => [...shopKeys.all, "items"] as const,
  item: (itemId: number) => [...shopKeys.all, "item", itemId] as const,
  myRequests: () => [...shopKeys.all, "my-requests"] as const,
  adminItems: () => [...shopKeys.all, "admin-items"] as const,
  adminRequestsRoot: () => [...shopKeys.all, "admin-requests"] as const,
  adminRequests: (status?: "pending" | "approved" | "rejected" | "completed") =>
    [...shopKeys.all, "admin-requests", status] as const,
};

export function useShopItems() {
  return useQuery({
    queryKey: shopKeys.items(),
    queryFn: shopApi.getItems,
  });
}

export function useShopItem(itemId: number | null) {
  return useQuery({
    queryKey: itemId ? shopKeys.item(itemId) : [...shopKeys.all, "item", "none"],
    queryFn: () => shopApi.getItem(itemId!),
    enabled: itemId !== null,
  });
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.createPurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
      queryClient.invalidateQueries({ queryKey: shopKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: shopKeys.adminRequestsRoot() });
      queryClient.invalidateQueries({ queryKey: ["student", "skill-map"] });
    },
  });
}

export function useMyPurchaseRequests() {
  return useQuery({
    queryKey: shopKeys.myRequests(),
    queryFn: shopApi.getMyPurchaseRequests,
  });
}

export function useAdminShopItems() {
  return useQuery({
    queryKey: shopKeys.adminItems(),
    queryFn: shopApi.getAdminItems,
  });
}

export function useCreateAdminShopItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.createAdminItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminItems() });
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
    },
  });
}

export function useUpdateAdminShopItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: number;
      payload:
        | Parameters<typeof shopApi.updateAdminItem>[1]
        | { multipart: true; body: Parameters<typeof shopApi.updateAdminItemMultipart>[1] };
    }) =>
      "multipart" in payload && payload.multipart
        ? shopApi.updateAdminItemMultipart(itemId, payload.body)
        : shopApi.updateAdminItem(itemId, payload as Parameters<typeof shopApi.updateAdminItem>[1]),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminItems() });
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
      queryClient.invalidateQueries({ queryKey: shopKeys.item(variables.itemId) });
    },
  });
}

export function useDeleteAdminShopItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.deleteAdminItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminItems() });
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
    },
  });
}

export function usePermanentDeleteAdminShopItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.deleteAdminItemPermanent,
    onSuccess: (_data, itemId) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminItems() });
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
      queryClient.invalidateQueries({ queryKey: shopKeys.item(itemId) });
    },
  });
}

export function useAdminPurchaseRequests(status?: "pending" | "approved" | "rejected" | "completed") {
  return useQuery({
    queryKey: shopKeys.adminRequests(status),
    queryFn: () => shopApi.getAdminPurchaseRequests(status),
  });
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: number; payload: { pickup_at: string; admin_comment?: string } }) =>
      shopApi.approvePurchaseRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminRequestsRoot() });
      queryClient.invalidateQueries({ queryKey: shopKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: shopKeys.items() });
    },
  });
}

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: number; payload?: { admin_comment?: string } }) =>
      shopApi.rejectPurchaseRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminRequestsRoot() });
      queryClient.invalidateQueries({ queryKey: shopKeys.myRequests() });
    },
  });
}

export function useCompletePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: number; payload?: { admin_comment?: string } }) =>
      shopApi.completePurchaseRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.adminRequestsRoot() });
      queryClient.invalidateQueries({ queryKey: shopKeys.myRequests() });
    },
  });
}
