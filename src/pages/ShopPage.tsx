import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePurchaseRequest, useMyPurchaseRequests, useShopItems } from "@/hooks/useShop";
import { useSkillMap } from "@/hooks/useStudent";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/error-handler";
import { resolveShopImageUrl } from "@/lib/resolve-shop-image-url";
import type { ShopItem } from "@/types";

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

export function ShopPage() {
  const { data: shopData, isLoading } = useShopItems();
  const { data: myRequests, refetch: refetchMyRequests } = useMyPurchaseRequests();
  const { data: skillMap } = useSkillMap();
  const createPurchaseRequest = useCreatePurchaseRequest();
  const { showSuccess } = useToast();

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "requests">("catalog");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("none");
  const [error, setError] = useState<string | null>(null);

  const items = shopData?.items || [];
  const totalSom = skillMap?.profile?.total_som || 0;

  const selectedTotalPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.price_som * quantity;
  }, [selectedItem, quantity]);

  const openConfirm = (item: ShopItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSize(item.sizes.length > 0 ? item.sizes[0] : "none");
    setError(null);
    setConfirmOpen(true);
  };

  const onBuy = async () => {
    if (!selectedItem) return;
    setError(null);
    try {
      await createPurchaseRequest.mutateAsync({
        item_id: selectedItem.id,
        quantity,
        selected_size: size === "none" ? undefined : size,
      });
      showSuccess("Заявка на покупку отправлена администратору");
      setConfirmOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось отправить заявку"));
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      refetchMyRequests();
    }
  }, [activeTab, refetchMyRequests]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton to="/profile" label="Назад в профиль" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Магазин</h1>
        <p className="text-muted-foreground">Обменивай SOM на призы и бонусы</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ваш баланс</p>
            <p className="font-semibold">{totalSom} SOM</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "catalog" | "requests")}>
        <TabsList>
          <TabsTrigger value="catalog">Магазин</TabsTrigger>
          <TabsTrigger value="requests">Мои заявки</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Товаров пока нет</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Администратор скоро добавит товары в магазин
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const firstPhoto = resolveShopImageUrl(item.photos?.[0]);
                return (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={item.name}
                        className="w-full aspect-square rounded-md border bg-muted object-contain p-1"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-md border bg-muted" />
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description || "Описание отсутствует"}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>{item.price_som} SOM</span>
                      <span className="text-muted-foreground">Осталось: {item.quantity}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Link to={`/shop/${item.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          Подробнее
                        </Button>
                      </Link>
                      <Button size="sm" onClick={() => openConfirm(item)}>Купить</Button>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Мои заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRequests?.requests?.length ? (
                myRequests.requests.slice(0, 10).map((request) => (
                  <div key={request.id} className="rounded-md border p-3 text-sm flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{request.item?.name || "Товар удален"}</p>
                      <p className="text-muted-foreground">
                        {request.quantity} шт. • {request.total_price_som} SOM
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{getRequestStatusLabel(request.status)}</p>
                      {request.approved_pickup_at && (
                        <p className="text-muted-foreground text-xs">
                          Забрать: {new Date(request.approved_pickup_at).toLocaleString("ru-RU")}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Заявок пока нет</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>{selectedItem?.name || "Покупка товара"}</DialogTitle>
            <DialogDescription>
              Подтвердите покупку. После этого администратор рассмотрит заявку.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedItem && resolveShopImageUrl(selectedItem.photos?.[0]) && (
              <img
                src={resolveShopImageUrl(selectedItem.photos?.[0]) || ""}
                alt={selectedItem.name}
                className="w-full max-w-[280px] aspect-square object-contain rounded-md border bg-muted p-1 mx-auto"
              />
            )}
            <p className="text-sm text-muted-foreground">
              {selectedItem?.description || "Описание отсутствует"}
            </p>
            <div className="text-sm flex items-center justify-between">
              <span>Цена</span>
              <span>{selectedItem?.price_som || 0} SOM</span>
            </div>
            <div>
              <p className="text-sm mb-1">Количество</p>
              <Input
                type="number"
                min={1}
                max={selectedItem?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value || 1))}
              />
            </div>
            {selectedItem && selectedItem.sizes.length > 0 && (
              <div>
                <p className="text-sm mb-1">Размер</p>
                <Select
                  value={size}
                  onChange={setSize}
                  options={selectedItem.sizes.map((s) => ({ value: s, label: s }))}
                />
              </div>
            )}
            <div className="rounded-md bg-muted p-3 text-sm flex items-center justify-between">
              <span>Итого</span>
              <span className="font-semibold">{selectedTotalPrice} SOM</span>
            </div>
            {selectedTotalPrice > totalSom && (
              <p className="text-sm text-destructive">
                Недостаточно SOM для покупки
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={onBuy}
              disabled={
                createPurchaseRequest.isPending ||
                selectedTotalPrice > totalSom ||
                quantity < 1 ||
                quantity > (selectedItem?.quantity || 0)
              }
            >
              {createPurchaseRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Подтвердить покупку
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
