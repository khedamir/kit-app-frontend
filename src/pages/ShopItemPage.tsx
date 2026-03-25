import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreatePurchaseRequest, useShopItem } from "@/hooks/useShop";
import { useSkillMap } from "@/hooks/useStudent";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/error-handler";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(
  /\/api\/v1\/?$/,
  ""
);

function resolveImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

export function ShopItemPage() {
  const params = useParams();
  const itemId = params.itemId ? Number(params.itemId) : null;
  const { data: item, isLoading, error } = useShopItem(Number.isFinite(itemId) ? itemId : null);
  const { data: skillMap } = useSkillMap();
  const createPurchaseRequest = useCreatePurchaseRequest();
  const { showSuccess } = useToast();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("none");
  const [buyError, setBuyError] = useState<string | null>(null);

  const totalSom = skillMap?.profile?.total_som || 0;
  const photos = item?.photos || [];
  const photoUrl = resolveImageUrl(photos[activePhotoIndex]);
  const selectedTotalPrice = useMemo(() => (item ? item.price_som * quantity : 0), [item, quantity]);

  const openBuy = () => {
    if (!item) return;
    setQuantity(1);
    setSize(item.sizes.length > 0 ? item.sizes[0] : "none");
    setBuyError(null);
    setConfirmOpen(true);
  };

  const onBuy = async () => {
    if (!item) return;
    setBuyError(null);
    try {
      await createPurchaseRequest.mutateAsync({
        item_id: item.id,
        quantity,
        selected_size: size === "none" ? undefined : size,
      });
      showSuccess("Заявка на покупку отправлена администратору");
      setConfirmOpen(false);
    } catch (err) {
      setBuyError(getApiErrorMessage(err, "Не удалось отправить заявку"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <BackButton to="/shop" label="Назад в магазин" />
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Товар не найден
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasPrev = activePhotoIndex > 0;
  const hasNext = activePhotoIndex < photos.length - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BackButton to="/shop" label="Назад в магазин" />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ваш баланс</p>
            <p className="font-semibold">{totalSom} SOM</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {photoUrl ? (
              <div className="relative w-full aspect-square rounded-md border bg-muted">
                <img
                  src={photoUrl}
                  alt={item.name}
                  className="w-full h-full object-contain p-2 rounded-md"
                />
                {photos.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => hasPrev && setActivePhotoIndex((p) => p - 1)}
                      disabled={!hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => hasNext && setActivePhotoIndex((p) => p + 1)}
                      disabled={!hasNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-square rounded-md border bg-muted" />
            )}

            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.map((p, idx) => (
                  <button
                    type="button"
                    key={`${p}-${idx}`}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`aspect-square rounded-md border overflow-hidden ${
                      idx === activePhotoIndex ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img
                      src={resolveImageUrl(p) || ""}
                      alt={`${item.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">{item.name}</CardTitle>
            </CardHeader>
            <p className="text-muted-foreground">
              {item.description || "Описание отсутствует"}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Цена</span>
                <span className="font-medium">{item.price_som} SOM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Доступно</span>
                <span>{item.quantity}</span>
              </div>
              {item.sizes.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Размеры: </span>
                  <span>{item.sizes.join(", ")}</span>
                </div>
              )}
            </div>
            <Button onClick={openBuy} className="w-full" disabled={item.quantity <= 0}>
              Купить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>
              Подтвердите покупку. После этого администратор рассмотрит заявку.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {resolveImageUrl(item.photos?.[0]) && (
              <img
                src={resolveImageUrl(item.photos?.[0]) || ""}
                alt={item.name}
                className="w-full max-w-[280px] aspect-square object-contain rounded-md border bg-muted p-1 mx-auto"
              />
            )}
            <div className="text-sm flex items-center justify-between">
              <span>Цена</span>
              <span>{item.price_som} SOM</span>
            </div>
            <div>
              <p className="text-sm mb-1">Количество</p>
              <Input
                type="number"
                min={1}
                max={item.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value || 1))}
              />
            </div>
            {item.sizes.length > 0 && (
              <div>
                <p className="text-sm mb-1">Размер</p>
                <Select
                  value={size}
                  onChange={setSize}
                  options={item.sizes.map((s) => ({ value: s, label: s }))}
                />
              </div>
            )}
            <div className="rounded-md bg-muted p-3 text-sm flex items-center justify-between">
              <span>Итого</span>
              <span className="font-semibold">{selectedTotalPrice} SOM</span>
            </div>
            {selectedTotalPrice > totalSom && (
              <p className="text-sm text-destructive">Недостаточно SOM для покупки</p>
            )}
            {buyError && <p className="text-sm text-destructive">{buyError}</p>}
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
                quantity > item.quantity
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
