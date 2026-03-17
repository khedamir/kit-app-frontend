import { useState } from "react";
import {
  Loader2,
  BookOpen,
  Plus,
  Trash2,
  Code2,
  Heart,
  Users,
  FolderOpen,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  useReferenceSkillCategories,
  useReferenceSkills,
  useReferenceInterests,
  useReferenceRoles,
  useCreateSkillCategory,
  useDeleteSkillCategory,
  useCreateSkill,
  useDeleteSkill,
  useCreateInterest,
  useDeleteInterest,
  useCreateRole,
  useDeleteRole,
  usePointCategories,
  useCreatePointCategory,
  useDeletePointCategory,
} from "@/hooks/useAdmin";

export function ReferenceManagementPage() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton to="/admin" label="Назад в панель" />
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Справочники
        </h1>
        <p className="text-muted-foreground mt-1">
          Заполните базу навыков, интересов и ролей для анкеты студентов
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-nowrap overflow-x-auto overflow-y-hidden gap-1 py-1.5 px-1 sm:flex-wrap sm:overflow-visible sm:inline-flex sm:w-auto sm:py-1 justify-start sm:justify-center [-webkit-overflow-scrolling:touch]">
          <TabsTrigger value="points" className="shrink-0">
            <Award className="h-4 w-4 shrink-0 mr-1 sm:mr-1.5" />
            Баллы
          </TabsTrigger>
          <TabsTrigger value="categories" className="shrink-0">
            <FolderOpen className="h-4 w-4 shrink-0 mr-1 sm:mr-1.5" />
            <span>Категории <span className="hidden sm:inline"> навыков</span></span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="shrink-0">
            <Code2 className="h-4 w-4 shrink-0 mr-1 sm:mr-1.5" />
            Навыки
          </TabsTrigger>
          <TabsTrigger value="interests" className="shrink-0">
            <Heart className="h-4 w-4 shrink-0 mr-1 sm:mr-1.5" />
            Интересы
          </TabsTrigger>
          <TabsTrigger value="roles" className="shrink-0">
            <Users className="h-4 w-4 shrink-0 mr-1 sm:mr-1.5" />
            Роли
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <PointsCriteriaTab />
        </TabsContent>
        <TabsContent value="categories">
          <SkillCategoriesTab />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>
        <TabsContent value="interests">
          <InterestsTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PointsCriteriaTab() {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [type, setType] = useState<"reward" | "penalty">("reward");
  const [confirm, setConfirm] = useState<{ id: number; label: string } | null>(null);
  const { showSuccess } = useToast();

  const { data, isLoading } = usePointCategories();
  const create = useCreatePointCategory();
  const remove = useDeletePointCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const raw = Number(points);
    if (!Number.isFinite(raw) || raw <= 0) return;
    const value = Math.abs(raw);
    const signedPoints = type === "penalty" ? -value : value;

    create.mutate(
      { name: trimmedName, points: signedPoints, is_penalty: type === "penalty" },
      {
        onSuccess: () => {
          setName("");
          setPoints("");
          setType("reward");
          showSuccess("Критерий добавлен");
        },
        onError: () => {},
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (confirm) {
      remove.mutate(confirm.id, { onSettled: () => setConfirm(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = data?.categories ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Критерии начисления баллов</CardTitle>
          <p className="text-sm text-muted-foreground">
            Определите список критериев (награды и штрафы), по которым администраторам будет удобно начислять баллы студентам.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="points-name">Название</Label>
              <Input
                id="points-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Победа в хакатоне"
                disabled={create.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="points-value">Баллы</Label>
              <Input
                id="points-value"
                type="number"
                min={1}
                value={points}
                onChange={(e) => {
                  const v = e.target.value;
                  // Разрешаем только пустую строку или положительные числа
                  if (v === "") {
                    setPoints("");
                    return;
                  }
                  const n = Number(v);
                  if (!Number.isFinite(n) || n <= 0) return;
                  setPoints(String(Math.abs(n)));
                }}
                placeholder="10"
                disabled={create.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="points-type">Тип</Label>
              <Select
                value={type}
                onChange={(value) => setType(value as "reward" | "penalty")}
                options={[
                  { value: "reward", label: "Награда (плюс)" },
                  { value: "penalty", label: "Штраф (минус)" },
                ]}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end pt-1">
              <Button
                type="submit"
                disabled={
                  !name.trim() ||
                  !points.trim() ||
                  !Number.isFinite(Number(points)) ||
                  Number(points) <= 0 ||
                  create.isPending
                }
              >
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Добавить критерий
              </Button>
            </div>
          </form>

          {create.isError && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(create.error)}
            </p>
          )}

          <ul className="divide-y">
            {categories.length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">
                Нет критериев. Добавьте первый.
              </li>
            ) : (
              categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {c.name}
                      <span
                        className={
                          c.points >= 0 ? "text-emerald-500 text-sm" : "text-red-500 text-sm"
                        }
                      >
                        {c.points > 0 ? `+${c.points}` : c.points} баллов
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.is_custom
                        ? "Произвольное начисление/списание"
                        : c.is_penalty
                          ? "Штраф"
                          : "Награда"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      setConfirm({
                        id: c.id,
                        label: c.name,
                      })
                    }
                    disabled={remove.isPending || c.is_custom}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Удалить критерий?"
        description={`Вы уверены, что хотите удалить критерий «${confirm?.label ?? ""}»? Он перестанет быть доступен при начислении баллов.`}
        confirmLabel="Удалить"
        onConfirm={handleDeleteConfirm}
        isLoading={remove.isPending}
      />
    </>
  );
}

function SkillCategoriesTab() {
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState<{ id: number; label: string } | null>(null);
  const { showSuccess } = useToast();
  const { data: categories, isLoading } = useReferenceSkillCategories();
  const create = useCreateSkillCategory();
  const remove = useDeleteSkillCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || create.isPending) return;
    create.mutate(trimmed, {
      onSuccess: () => {
        setName("");
        showSuccess("Категория добавлена");
      },
      onError: () => {},
    });
  };

  const handleDeleteConfirm = () => {
    if (confirm) {
      remove.mutate(confirm.id, { onSettled: () => setConfirm(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Категории навыков</CardTitle>
          <p className="text-sm text-muted-foreground">
            Сначала создайте категории (например: «Программирование», «Дизайн»), затем добавляйте навыки в разделе «Навыки».
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cat-name" className="sr-only">Название категории</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название категории"
                disabled={create.isPending}
              />
            </div>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить
            </Button>
          </form>
          {create.isError && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(create.error)}
            </p>
          )}
          <ul className="divide-y">
            {(categories ?? []).length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">Нет категорий. Добавьте первую.</li>
            ) : (
              (categories ?? []).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span>{c.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirm({ id: c.id, label: c.name })}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Удалить категорию?"
        description={`Вы уверены, что хотите удалить категорию «${confirm?.label ?? ""}»? Категорию можно удалить только если в ней нет навыков.`}
        confirmLabel="Удалить"
        onConfirm={handleDeleteConfirm}
        isLoading={remove.isPending}
      />
    </>
  );
}

function SkillsTab() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [confirm, setConfirm] = useState<{ id: number; label: string } | null>(null);
  const { showSuccess } = useToast();
  const { data: categories, isLoading: catLoading } = useReferenceSkillCategories();
  const categoryIdNum = categoryId && categoryId !== "" ? Number(categoryId) : undefined;
  const { data: skills, isLoading: skillsLoading } = useReferenceSkills(categoryIdNum);
  const create = useCreateSkill();
  const remove = useDeleteSkill();

  const categoryOptions = (categories ?? []).map((c) => ({ value: String(c.id), label: c.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !categoryId || create.isPending) return;
    create.mutate(
      { name: trimmed, categoryId: Number(categoryId) },
      {
        onSuccess: () => {
          setName("");
          showSuccess("Навык добавлен");
        },
        onError: () => {},
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (confirm) {
      remove.mutate(confirm.id, { onSettled: () => setConfirm(null) });
    }
  };

  const isLoading = catLoading || skillsLoading;

  if (catLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Навыки</CardTitle>
        <p className="text-sm text-muted-foreground">
          Выберите категорию и добавьте навыки. Студенты выбирают их в анкете и указывают уровень.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Label htmlFor="skill-cat" className="sr-only">Категория</Label>
            <Select
              value={categoryId}
              onChange={setCategoryId}
              options={[{ value: "", label: "Выберите категорию..." }, ...categoryOptions]}
              placeholder="Категория"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="skill-name" className="sr-only">Название навыка</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название навыка"
              disabled={create.isPending}
            />
          </div>
          <Button type="submit" disabled={!name.trim() || !categoryId || create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Добавить
          </Button>
        </form>
        {create.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(create.error)}
          </p>
        )}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {categoryId ? `Навыки в категории` : "Все навыки (выберите категорию для фильтра)"}
          </p>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <ul className="divide-y">
              {(skills ?? []).length === 0 ? (
                <li className="py-6 text-center text-muted-foreground text-sm">
                  Нет навыков. Добавьте категории в первом разделе, затем навыки здесь.
                </li>
              ) : (
                (skills ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">({s.category.name})</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirm({ id: s.id, label: `${s.name} (${s.category.name})` })}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
    <ConfirmDialog
      open={!!confirm}
      onOpenChange={(open) => !open && setConfirm(null)}
      title="Удалить навык?"
      description={`Вы уверены, что хотите удалить навык «${confirm?.label ?? ""}»?`}
      confirmLabel="Удалить"
      onConfirm={handleDeleteConfirm}
      isLoading={remove.isPending}
    />
    </>
  );
}

function InterestsTab() {
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState<{ id: number; label: string } | null>(null);
  const { showSuccess } = useToast();
  const { data: interests, isLoading } = useReferenceInterests();
  const create = useCreateInterest();
  const remove = useDeleteInterest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || create.isPending) return;
    create.mutate(trimmed, {
      onSuccess: () => {
        setName("");
        showSuccess("Интерес добавлен");
      },
      onError: () => {},
    });
  };

  const handleDeleteConfirm = () => {
    if (confirm) {
      remove.mutate(confirm.id, { onSettled: () => setConfirm(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Интересы</CardTitle>
          <p className="text-sm text-muted-foreground">
            Список интересов для анкеты студента (например: «Веб-разработка», «Мобильные приложения»).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="interest-name" className="sr-only">Название</Label>
              <Input
                id="interest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название интереса"
                disabled={create.isPending}
              />
            </div>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить
            </Button>
          </form>
          {create.isError && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(create.error)}
            </p>
          )}
          <ul className="divide-y">
            {(interests ?? []).length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">Нет интересов. Добавьте первый.</li>
            ) : (
              (interests ?? []).map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <span>{i.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirm({ id: i.id, label: i.name })}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Удалить интерес?"
        description={`Вы уверены, что хотите удалить интерес «${confirm?.label ?? ""}»?`}
        confirmLabel="Удалить"
        onConfirm={handleDeleteConfirm}
        isLoading={remove.isPending}
      />
    </>
  );
}

function RolesTab() {
  const [code, setCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [confirm, setConfirm] = useState<{ id: number; label: string } | null>(null);
  const { showSuccess } = useToast();
  const { data: roles, isLoading } = useReferenceRoles();
  const create = useCreateRole();
  const remove = useDeleteRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const trimmedName = roleName.trim();
    if (!trimmedCode || !trimmedName || create.isPending) return;
    create.mutate(
      { code: trimmedCode, name: trimmedName },
      {
        onSuccess: () => {
          setCode("");
          setRoleName("");
          showSuccess("Роль добавлена");
        },
        onError: () => {},
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (confirm) {
      remove.mutate(confirm.id, { onSettled: () => setConfirm(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Роли в команде</CardTitle>
          <p className="text-sm text-muted-foreground">
            Роли для формирования команд (например: код «leader», название «Лидер»).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="role-code">Код</Label>
              <Input
                id="role-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="leader"
                disabled={create.isPending}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="role-name">Название</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Лидер"
                disabled={create.isPending}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={!code.trim() || !roleName.trim() || create.isPending}>
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Добавить
              </Button>
            </div>
          </form>
          {create.isError && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(create.error)}
            </p>
          )}
          <ul className="divide-y">
            {(roles ?? []).length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">Нет ролей. Добавьте первую.</li>
            ) : (
              (roles ?? []).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">({r.code})</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirm({ id: r.id, label: `${r.name} (${r.code})` })}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Удалить роль?"
        description={`Вы уверены, что хотите удалить роль «${confirm?.label ?? ""}»?`}
        confirmLabel="Удалить"
        onConfirm={handleDeleteConfirm}
        isLoading={remove.isPending}
      />
    </>
  );
}
