import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Store, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/error-handler";
import type { ShopItem } from "@/types";
import {
  useAdminPurchaseRequests,
  useAdminShopItems,
  useApprovePurchaseRequest,
  useCompletePurchaseRequest,
  useCreateAdminShopItem,
  useRejectPurchaseRequest,
} from "@/hooks/useShop";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

function resolveImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

function getRequestStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Ожидает";
    case "approved":
      return "Подтверждено";
    case "rejected":
      return "Отклонено";
    case "completed":
      return "Завершено";
    default:
      return status;
  }
}

export function ShopManagementPage() {
  const { showSuccess } = useToast();
  const [activeSection, setActiveSection] = useState<"products" | "requests">("products");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "completed">("pending");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price_som: "",
    quantity: "",
    sizes: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [pickupByRequest, setPickupByRequest] = useState<Record<number, string>>({});
  const [commentByRequest, setCommentByRequest] = useState<Record<number, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useAdminShopItems();
  const { data: pendingRequestsData, refetch: refetchPendingRequests } = useAdminPurchaseRequests("pending");
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useAdminPurchaseRequests(
    statusFilter
  );

  const createItem = useCreateAdminShopItem();
  const approveRequest = useApprovePurchaseRequest();
  const rejectRequest = useRejectPurchaseRequest();
  const completeRequest = useCompletePurchaseRequest();

  const totalPending = useMemo(
    () => (pendingRequestsData?.requests || []).length,
    [pendingRequestsData]
  );

  const onCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await createItem.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price_som: Number(form.price_som),
        quantity: Number(form.quantity),
        photo_files: photoFiles,
        sizes: form.sizes
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      });
      setForm({
        name: "",
        description: "",
        price_som: "",
        quantity: "",
        sizes: "",
      });
      setPhotoFiles([]);
      showSuccess("Товар добавлен");
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось добавить товар"));
    }
  };

  const onApprove = async (requestId: number) => {
    const pickupAt = pickupByRequest[requestId];
    try {
      await approveRequest.mutateAsync({
        requestId,
        payload: {
          pickup_at: pickupAt,
          admin_comment: commentByRequest[requestId] || undefined,
        },
      });
      showSuccess("Заявка подтверждена");
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось подтвердить заявку"));
    }
  };

  const onReject = async (requestId: number) => {
    try {
      await rejectRequest.mutateAsync({
        requestId,
        payload: {
          admin_comment: commentByRequest[requestId] || undefined,
        },
      });
      showSuccess("Заявка отклонена");
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось отклонить заявку"));
    }
  };

  const onComplete = async (requestId: number) => {
    try {
      await completeRequest.mutateAsync({
        requestId,
        payload: {
          admin_comment: commentByRequest[requestId] || undefined,
        },
      });
      showSuccess("Заявка завершена");
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось завершить заявку"));
    }
  };

  const photoPreviews = useMemo(
    () => photoFiles.map((file) => URL.createObjectURL(file)),
    [photoFiles]
  );

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const movePhoto = (index: number, direction: "up" | "down") => {
    setPhotoFiles((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (activeSection === "requests") {
      refetchRequests();
      refetchPendingRequests();
    }
  }, [activeSection, refetchRequests, refetchPendingRequests]);

  return (
    <div className="space-y-6">
      <BackButton to="/admin" label="Назад в панель" />

      <div>
        <h1 className="text-3xl font-bold mb-2">Управление магазином</h1>
        <p className="text-muted-foreground">
          Добавляйте товары и обрабатывайте заявки студентов
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as "products" | "requests")}>
        <TabsList>
          <TabsTrigger value="products">Управление товарами</TabsTrigger>
          <TabsTrigger value="requests">
            Управление заявками {totalPending > 0 ? `(${totalPending})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Управление товарами
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onCreateItem}>
                <Input
                  placeholder="Название"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Цена (SOM)"
                  type="number"
                  min={0}
                  value={form.price_som}
                  onChange={(e) => setForm((p) => ({ ...p, price_som: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Количество"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Размеры через запятую (опц.)"
                  value={form.sizes}
                  onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value }))}
                />
                <textarea
                  placeholder="Описание"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="md:col-span-2 min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="md:col-span-2 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPhotoFiles((prev) => [...prev, ...files]);
                      e.currentTarget.value = "";
                    }}
                  />
                  {photoFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Выбрано файлов: {photoFiles.length}. Первый файл будет главным фото.
                      </p>
                      <div className="space-y-1">
                        {photoFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between gap-2 rounded-md border p-2"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <img
                                src={photoPreviews[index]}
                                alt={file.name}
                                className="h-12 w-12 rounded-md border object-cover bg-muted flex-shrink-0"
                              />
                              <div className="min-w-0">
                              <p className="text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                onClick={() => movePhoto(index, "up")}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === photoFiles.length - 1}
                                onClick={() => movePhoto(index, "down")}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removePhoto(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createItem.isPending}>
                    {createItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить товар"}
                  </Button>
                </div>
              </form>
              {createError && <p className="text-sm text-destructive mt-2">{createError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список товаров</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {itemsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                (itemsData?.items || []).map((item) => (
                  <div key={item.id} className="border rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {resolveImageUrl(item.photos?.[0]) ? (
                        <img
                          src={resolveImageUrl(item.photos?.[0]) || ""}
                          alt={item.name}
                          className="h-12 w-12 rounded-md object-cover border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md border bg-muted" />
                      )}
                      <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price_som} SOM • Остаток: {item.quantity}
                      </p>
                    </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                      Подробнее
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Управление заявками {totalPending > 0 ? `(${totalPending})` : ""}
                </span>
                <span className="text-sm text-muted-foreground">Ожидают: {totalPending}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as "pending" | "approved" | "rejected" | "completed")}
                options={[
                  { value: "pending", label: "Ожидают" },
                  { value: "approved", label: "Подтверждённые" },
                  { value: "rejected", label: "Отклонённые" },
                  { value: "completed", label: "Завершенные" },
                ]}
              />
              {requestsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                (requestsData?.requests || []).map((request) => (
                  <div key={request.id} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {request.item?.name || "Товар удален"} • {request.total_price_som} SOM
                      </p>
                      <p className="text-sm">{getRequestStatusLabel(request.status)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Студент: {request.student?.last_name || ""} {request.student?.first_name || ""} ({request.student?.group_name || "—"})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Кол-во: {request.quantity}
                      {request.selected_size ? ` • Размер: ${request.selected_size}` : ""}
                    </p>
                    {request.status === "pending" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          type="datetime-local"
                          value={pickupByRequest[request.id] || ""}
                          onChange={(e) =>
                            setPickupByRequest((prev) => ({ ...prev, [request.id]: e.target.value }))
                          }
                        />
                        <Input
                          placeholder="Комментарий (опц.)"
                          value={commentByRequest[request.id] || ""}
                          onChange={(e) =>
                            setCommentByRequest((prev) => ({ ...prev, [request.id]: e.target.value }))
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => onApprove(request.id)}
                            disabled={!pickupByRequest[request.id] || approveRequest.isPending}
                          >
                            Подтвердить
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => onReject(request.id)}
                            disabled={rejectRequest.isPending}
                          >
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    )}
                    {request.status === "approved" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="Комментарий (опц.)"
                          value={commentByRequest[request.id] || ""}
                          onChange={(e) =>
                            setCommentByRequest((prev) => ({ ...prev, [request.id]: e.target.value }))
                          }
                        />
                        <Button
                          onClick={() => onComplete(request.id)}
                          disabled={completeRequest.isPending}
                        >
                          Отметить как завершено
                        </Button>
                      </div>
                    )}
                    {request.approved_pickup_at && (
                      <p className="text-sm text-muted-foreground">
                        Забрать можно: {new Date(request.approved_pickup_at).toLocaleString("ru-RU")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent onClose={() => setSelectedItem(null)}>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name || "Товар"}</DialogTitle>
            <DialogDescription>Подробная информация о товаре</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-3">
              {resolveImageUrl(selectedItem.photos?.[0]) && (
                <img
                  src={resolveImageUrl(selectedItem.photos?.[0]) || ""}
                  alt={selectedItem.name}
                  className="w-full max-w-[320px] aspect-square object-contain rounded-md border bg-muted p-1 mx-auto"
                />
              )}
              <p className="text-sm text-muted-foreground">
                {selectedItem.description || "Описание отсутствует"}
              </p>
              <div className="text-sm flex items-center justify-between">
                <span>Цена</span>
                <span>{selectedItem.price_som} SOM</span>
              </div>
              <div className="text-sm flex items-center justify-between">
                <span>Остаток</span>
                <span>{selectedItem.quantity}</span>
              </div>
              {selectedItem.sizes.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Размеры: {selectedItem.sizes.join(", ")}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
