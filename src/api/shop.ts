import { apiClient } from "./client";
import type { ShopItem, ShopPurchaseRequest } from "@/types";

export const shopApi = {
  getItems: async (): Promise<{ items: ShopItem[] }> => {
    const { data } = await apiClient.get<{ items: ShopItem[] }>("/shop/items");
    return data;
  },

  getItem: async (itemId: number): Promise<ShopItem> => {
    const { data } = await apiClient.get<ShopItem>(`/shop/items/${itemId}`);
    return data;
  },

  createPurchaseRequest: async (payload: {
    item_id: number;
    quantity: number;
    selected_size?: string;
  }): Promise<ShopPurchaseRequest> => {
    const { data } = await apiClient.post<ShopPurchaseRequest>(
      "/shop/purchase-requests",
      payload
    );
    return data;
  },

  getMyPurchaseRequests: async (): Promise<{ requests: ShopPurchaseRequest[] }> => {
    const { data } = await apiClient.get<{ requests: ShopPurchaseRequest[] }>(
      "/shop/purchase-requests/me"
    );
    return data;
  },

  // Admin
  getAdminItems: async (): Promise<{ items: ShopItem[] }> => {
    const { data } = await apiClient.get<{ items: ShopItem[] }>("/admins/shop/items");
    return data;
  },

  createAdminItem: async (payload: {
    name: string;
    description?: string;
    price_som: number;
    quantity: number;
    sizes: string[];
    photo_urls?: string[];
    photo_files?: File[];
    is_active?: boolean;
  }): Promise<ShopItem> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description || "");
    formData.append("price_som", String(payload.price_som));
    formData.append("quantity", String(payload.quantity));
    formData.append("sizes", payload.sizes.join(","));
    formData.append("photo_urls", (payload.photo_urls || []).join(","));
    (payload.photo_files || []).forEach((file) => {
      formData.append("photos", file);
    });

    const { data } = await apiClient.post<ShopItem>("/admins/shop/items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateAdminItem: async (
    itemId: number,
    payload: Partial<{
      name: string;
      description: string;
      price_som: number;
      quantity: number;
      photos: string[];
      sizes: string[];
      is_active: boolean;
    }>
  ): Promise<ShopItem> => {
    const { data } = await apiClient.patch<ShopItem>(`/admins/shop/items/${itemId}`, payload);
    return data;
  },

  /** Полное обновление с файлами (как при создании): photo_urls + новые uploads. */
  updateAdminItemMultipart: async (
    itemId: number,
    payload: {
      name: string;
      description?: string;
      price_som: number;
      quantity: number;
      sizes: string[];
      photo_urls: string[];
      photo_files?: File[];
      is_active?: boolean;
    }
  ): Promise<ShopItem> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description || "");
    formData.append("price_som", String(payload.price_som));
    formData.append("quantity", String(payload.quantity));
    formData.append("sizes", payload.sizes.join(","));
    formData.append("photo_urls", payload.photo_urls.join(","));
    if (payload.is_active !== undefined) {
      formData.append("is_active", payload.is_active ? "true" : "false");
    }
    (payload.photo_files || []).forEach((file) => {
      formData.append("photos", file);
    });
    const { data } = await apiClient.patch<ShopItem>(`/admins/shop/items/${itemId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteAdminItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/admins/shop/items/${itemId}`);
  },

  /** Полное удаление товара и файлов; 409 если есть заявки. */
  deleteAdminItemPermanent: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/admins/shop/items/${itemId}/permanent`);
  },

  getAdminPurchaseRequests: async (
    status?: "pending" | "approved" | "rejected" | "completed"
  ): Promise<{ requests: ShopPurchaseRequest[] }> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<{ requests: ShopPurchaseRequest[] }>(
      "/admins/shop/purchase-requests",
      { params }
    );
    return data;
  },

  approvePurchaseRequest: async (
    requestId: number,
    payload: { pickup_at: string; admin_comment?: string }
  ): Promise<ShopPurchaseRequest> => {
    const { data } = await apiClient.patch<ShopPurchaseRequest>(
      `/admins/shop/purchase-requests/${requestId}/approve`,
      payload
    );
    return data;
  },

  rejectPurchaseRequest: async (
    requestId: number,
    payload?: { admin_comment?: string }
  ): Promise<ShopPurchaseRequest> => {
    const { data } = await apiClient.patch<ShopPurchaseRequest>(
      `/admins/shop/purchase-requests/${requestId}/reject`,
      payload || {}
    );
    return data;
  },

  completePurchaseRequest: async (
    requestId: number,
    payload?: { admin_comment?: string }
  ): Promise<ShopPurchaseRequest> => {
    const { data } = await apiClient.patch<ShopPurchaseRequest>(
      `/admins/shop/purchase-requests/${requestId}/complete`,
      payload || {}
    );
    return data;
  },
};
