import { ShoppingBag, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ShopPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Магазин</h1>
        <p className="text-muted-foreground">
          Обменивай баллы на призы и бонусы
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-50" />
              <Wrench className="h-8 w-8 text-primary absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Раздел в разработке</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Скоро здесь появится магазин, где вы сможете обменивать заработанные баллы на призы и бонусы
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
