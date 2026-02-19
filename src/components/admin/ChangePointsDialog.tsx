import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Minus, Award, AlertTriangle, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePointCategories, useAddStudentPoints } from "@/hooks/useAdmin";
import { getApiErrorMessage } from "@/lib/error-handler";
import type { AdminStudentItem } from "@/types";

interface ChangePointsDialogProps {
  student: AdminStudentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangePointsDialog({
  student,
  open,
  onOpenChange,
  onSuccess,
}: ChangePointsDialogProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = usePointCategories();
  const addPoints = useAddStudentPoints();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none");
  const [customPoints, setCustomPoints] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesData?.categories || [];

  // Разделяем категории
  const rewardCategories = useMemo(
    () => categories.filter((c) => !c.is_penalty && !c.is_custom),
    [categories]
  );
  const penaltyCategories = useMemo(
    () => categories.filter((c) => c.is_penalty && !c.is_custom),
    [categories]
  );
  const customCategory = useMemo(
    () => categories.find((c) => c.is_custom),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  // Опции для селекта
  const categoryOptions = useMemo(() => {
    const options = [{ value: "none", label: "Выберите категорию..." }];

    if (rewardCategories.length > 0) {
      options.push({ value: "header-rewards", label: "── Награды ──" });
      rewardCategories.forEach((c) => {
        options.push({
          value: String(c.id),
          label: `${c.name} (+${c.points} баллов)`,
        });
      });
    }

    if (penaltyCategories.length > 0) {
      options.push({ value: "header-penalties", label: "── Штрафы ──" });
      penaltyCategories.forEach((c) => {
        options.push({
          value: String(c.id),
          label: `${c.name} (${c.points} баллов)`,
        });
      });
    }

    if (customCategory) {
      options.push({ value: "header-custom", label: "── Прочее ──" });
      options.push({
        value: String(customCategory.id),
        label: "Произвольное начисление/списание",
      });
    }

    return options;
  }, [rewardCategories, penaltyCategories, customCategory]);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (open) {
      setSelectedCategoryId("none");
      setCustomPoints("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  // Расчёт баллов и SOM
  const pointsToAdd = useMemo(() => {
    if (!selectedCategory) return 0;
    if (selectedCategory.is_custom) {
      return parseInt(customPoints) || 0;
    }
    return selectedCategory.points;
  }, [selectedCategory, customPoints]);

  const somToAdd = useMemo(() => {
    if (pointsToAdd > 0) {
      return Math.floor(pointsToAdd / 5);
    }
    return 0;
  }, [pointsToAdd]);

  const handleSubmit = async () => {
    if (!student?.id || !selectedCategory) return;

    setError(null);

    // Валидация
    if (selectedCategory.is_custom) {
      if (!customPoints || parseInt(customPoints) === 0) {
        setError("Укажите количество баллов");
        return;
      }
      if (!description.trim()) {
        setError("Укажите причину");
        return;
      }
    }

    try {
      await addPoints.mutateAsync({
        studentId: student.id,
        request: {
          category_id: selectedCategory.id,
          points: selectedCategory.is_custom ? parseInt(customPoints) : undefined,
          description: description.trim() || undefined,
        },
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Ошибка при изменении баллов"));
    }
  };

  const fullName =
    student?.first_name && student?.last_name
      ? `${student.first_name} ${student.last_name}`
      : student?.email || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Изменить баллы
          </DialogTitle>
        </DialogHeader>

        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Информация о студенте */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{fullName}</p>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  {student?.total_points || 0} баллов
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-green-500" />
                  {student?.total_som || 0} SOM
                </span>
              </div>
            </div>

            {/* Выбор категории */}
            <div>
              <Label className="mb-1.5 block">Категория</Label>
              <Select
                value={selectedCategoryId}
                onChange={(value) => {
                  if (!value.startsWith("header-")) {
                    setSelectedCategoryId(value);
                  }
                }}
                options={categoryOptions}
                placeholder="Выберите категорию..."
              />
            </div>

            {/* Поля для кастомной категории */}
            {selectedCategory?.is_custom && (
              <>
                <div>
                  <Label className="mb-1.5 block">Количество баллов</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCustomPoints((prev) =>
                          String(Math.max(-100, (parseInt(prev) || 0) - 5))
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={customPoints}
                      onChange={(e) => setCustomPoints(e.target.value)}
                      placeholder="0"
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCustomPoints((prev) =>
                          String(Math.min(100, (parseInt(prev) || 0) + 5))
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Положительное значение — награда, отрицательное — штраф
                  </p>
                </div>

                <div>
                  <Label className="mb-1.5 block">Причина / Примечание *</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите причину начисления/списания баллов..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Обязательно укажите за что начисляются или списываются баллы
                  </p>
                </div>
              </>
            )}

            {/* Примечание для обычной категории (опционально) */}
            {selectedCategory && !selectedCategory.is_custom && (
              <div>
                <Label className="mb-1.5 block">Примечание (опционально)</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительные детали..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            )}

            {/* Предпросмотр изменений */}
            {selectedCategory && selectedCategoryId !== "none" && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Изменение:</span>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={pointsToAdd > 0 ? "default" : "destructive"}
                      className="gap-1"
                    >
                      {pointsToAdd > 0 ? "+" : ""}
                      {pointsToAdd} баллов
                    </Badge>
                    {somToAdd > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Coins className="h-3 w-3" />+{somToAdd} SOM
                      </Badge>
                    )}
                  </div>
                </div>

                {pointsToAdd < 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Баллы будут списаны со счёта студента
                  </div>
                )}
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !selectedCategory ||
                  selectedCategoryId === "none" ||
                  addPoints.isPending ||
                  (selectedCategory.is_custom && !customPoints)
                }
                className="flex-1"
              >
                {addPoints.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : pointsToAdd >= 0 ? (
                  "Начислить"
                ) : (
                  "Списать"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
