import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/error-handler";
import { resolveShopImageUrl } from "@/lib/resolve-shop-image-url";
import type { ShopItem } from "@/types";
import {
  useAdminPurchaseRequests,
  useAdminShopItems,
  useApprovePurchaseRequest,
  useCompletePurchaseRequest,
  useCreateAdminShopItem,
  useDeleteAdminShopItem,
  usePermanentDeleteAdminShopItem,
  useRejectPurchaseRequest,
  useUpdateAdminShopItem,
} from "@/hooks/useShop";

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
  const [deletingItem, setDeletingItem] = useState<ShopItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price_som: "",
    quantity: "",
    sizes: "",
    is_active: true,
  });
  const [editExistingPhotoUrls, setEditExistingPhotoUrls] = useState<string[]>([]);
  const [editNewPhotoFiles, setEditNewPhotoFiles] = useState<File[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useAdminShopItems();
  const { data: pendingRequestsData, refetch: refetchPendingRequests } = useAdminPurchaseRequests("pending");
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useAdminPurchaseRequests(
    statusFilter
  );

  const createItem = useCreateAdminShopItem();
  const updateItem = useUpdateAdminShopItem();
  const deleteItem = useDeleteAdminShopItem();
  const permanentDeleteItem = usePermanentDeleteAdminShopItem();
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

  const openEditDialog = (item: ShopItem) => {
    setEditError(null);
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || "",
      price_som: String(item.price_som),
      quantity: String(item.quantity),
      sizes: (item.sizes || []).join(", "),
      is_active: item.is_active,
    });
    setEditExistingPhotoUrls([...(item.photos || [])]);
    setEditNewPhotoFiles([]);
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);
    try {
      await updateItem.mutateAsync({
        itemId: editingItem.id,
        payload: {
          multipart: true,
          body: {
            name: editForm.name.trim(),
            description: editForm.description.trim() || undefined,
            price_som: Number(editForm.price_som),
            quantity: Number(editForm.quantity),
            sizes: editForm.sizes
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
            photo_urls: editExistingPhotoUrls,
            photo_files: editNewPhotoFiles,
            is_active: editForm.is_active,
          },
        },
      });
      setEditingItem(null);
      showSuccess("Товар обновлён");
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Не удалось сохранить товар"));
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingItem) return;
    const id = deletingItem.id;
    try {
      await deleteItem.mutateAsync(id);
      showSuccess("Товар скрыт из каталога");
      setDeletingItem(null);
      setSelectedItem((prev) => (prev?.id === id ? null : prev));
      setEditingItem((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось удалить товар"));
      setDeletingItem(null);
    }
  };

  const onConfirmPermanentDelete = async () => {
    if (!deletingItem) return;
    const id = deletingItem.id;
    if ((deletingItem.purchase_requests_count ?? 0) > 0) return;
    try {
      await permanentDeleteItem.mutateAsync(id);
      showSuccess("Товар удалён безвозвратно");
      setDeletingItem(null);
      setSelectedItem((prev) => (prev?.id === id ? null : prev));
      setEditingItem((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Не удалось удалить товар"));
      setDeletingItem(null);
    }
  };

  const moveEditExistingUrl = (index: number, direction: "up" | "down") => {
    setEditExistingPhotoUrls((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const removeEditExistingUrl = (index: number) => {
    setEditExistingPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveEditNewPhoto = (index: number, direction: "up" | "down") => {
    setEditNewPhotoFiles((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const removeEditNewPhoto = (index: number) => {
    setEditNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
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

  const editNewPhotoPreviews = useMemo(
    () => editNewPhotoFiles.map((file) => URL.createObjectURL(file)),
    [editNewPhotoFiles]
  );

  useEffect(() => {
    return () => {
      editNewPhotoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [editNewPhotoPreviews]);

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
                  <div
                    key={item.id}
                    className={`border rounded-md p-3 flex items-center justify-between ${
                      item.is_active ? "" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {resolveShopImageUrl(item.photos?.[0]) ? (
                        <img
                          src={resolveShopImageUrl(item.photos?.[0]) || ""}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                        Подробнее
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Изменить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
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
              {resolveShopImageUrl(selectedItem.photos?.[0]) && (
                <img
                  src={resolveShopImageUrl(selectedItem.photos?.[0]) || ""}
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
              {!selectedItem.is_active && (
                <p className="text-sm text-amber-600">Не отображается в каталоге</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deletingItem !== null} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent onClose={() => setDeletingItem(null)}>
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
            <DialogDescription className="space-y-2">
              <span>
                «{deletingItem?.name}» можно скрыть из каталога (заявки сохранятся) или удалить полностью — только
                если на этот товар ещё не было заявок.
              </span>
              {deletingItem && (deletingItem.purchase_requests_count ?? 0) > 0 && (
                <span className="block text-amber-600 dark:text-amber-500">
                  Заявок: {deletingItem.purchase_requests_count}. Полное удаление недоступно.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDeletingItem(null)}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteItem.isPending || permanentDeleteItem.isPending}
              onClick={() => void onConfirmDelete()}
            >
              {deleteItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Скрыть из каталога"}
            </Button>
            {deletingItem != null && (deletingItem.purchase_requests_count ?? 0) === 0 && (
              <Button
                type="button"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                disabled={deleteItem.isPending || permanentDeleteItem.isPending}
                onClick={() => void onConfirmPermanentDelete()}
              >
                {permanentDeleteItem.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Удалить навсегда"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent onClose={() => setEditingItem(null)} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
            <DialogDescription>Измените поля и сохраните. Новые фото добавляются в конец галереи.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form className="grid grid-cols-1 gap-3" onSubmit={onSaveEdit}>
              <Input
                placeholder="Название"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Цена (SOM)"
                type="number"
                min={0}
                value={editForm.price_som}
                onChange={(e) => setEditForm((p) => ({ ...p, price_som: e.target.value }))}
                required
              />
              <Input
                placeholder="Количество"
                type="number"
                min={0}
                value={editForm.quantity}
                onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
                required
              />
              <Input
                placeholder="Размеры через запятую (опц.)"
                value={editForm.sizes}
                onChange={(e) => setEditForm((p) => ({ ...p, sizes: e.target.value }))}
              />
              <textarea
                placeholder="Описание"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={editForm.is_active}
                  onCheckedChange={(v) => setEditForm((p) => ({ ...p, is_active: v }))}
                />
                Показывать в каталоге студентов
              </label>

              <div className="space-y-2">
                <p className="text-sm font-medium">Текущие фото</p>
                {editExistingPhotoUrls.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет — можно добавить файлы ниже.</p>
                ) : (
                  <div className="space-y-1">
                    {editExistingPhotoUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-md border p-2"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {resolveShopImageUrl(url) ? (
                            <img
                              src={resolveShopImageUrl(url) || ""}
                              alt=""
                              className="h-12 w-12 rounded-md border object-cover bg-muted flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md border bg-muted flex-shrink-0" />
                          )}
                          <p className="text-xs text-muted-foreground truncate">{url}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveEditExistingUrl(index, "up")}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === editExistingPhotoUrls.length - 1}
                            onClick={() => moveEditExistingUrl(index, "down")}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeEditExistingUrl(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setEditNewPhotoFiles((prev) => [...prev, ...files]);
                    e.currentTarget.value = "";
                  }}
                />
                {editNewPhotoFiles.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Новые файлы ({editNewPhotoFiles.length}) добавятся после текущих фото.
                    </p>
                    {editNewPhotoFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-md border p-2"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <img
                            src={editNewPhotoPreviews[index]}
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
                            onClick={() => moveEditNewPhoto(index, "up")}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === editNewPhotoFiles.length - 1}
                            onClick={() => moveEditNewPhoto(index, "down")}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeEditNewPhoto(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={updateItem.isPending}>
                  {updateItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
