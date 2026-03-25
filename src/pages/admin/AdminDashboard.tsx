import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  Loader2,
  Edit3,
  Save,
  ArrowRight,
  BookOpen,
  Shield,
  Trash2,
  Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
} from "@/hooks/useAdmin";
import { getApiErrorMessage } from "@/lib/error-handler";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { AdminUserItem } from "@/types";

export function AdminDashboard() {
  const { data: profile, isLoading, error } = useAdminProfile();
  const updateProfile = useUpdateAdminProfile();
  const { data: adminUsers, isLoading: isAdminsLoading } = useAdminUsers();
  const createAdminUser = useCreateAdminUser();
  const deleteAdminUser = useDeleteAdminUser();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
  });
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    full_name: "",
    position: "",
  });
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminUserItem | null>(null);
  const [deleteAdminError, setDeleteAdminError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Ошибка загрузки профиля
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile.email.substring(0, 2).toUpperCase();

  const handleEdit = () => {
    setSaveError(null);
    setFormData({
      full_name: profile.full_name || "",
      position: profile.position || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch {
      setSaveError("Не удалось сохранить изменения");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);

    if (!adminForm.email || !adminForm.password) {
      setAdminFormError("Email и пароль обязательны");
      return;
    }

    try {
      await createAdminUser.mutateAsync({
        email: adminForm.email,
        password: adminForm.password,
        full_name: adminForm.full_name || undefined,
        position: adminForm.position || undefined,
      });

      setAdminForm({
        email: "",
        password: "",
        full_name: "",
        position: "",
      });
    } catch (err) {
      setAdminFormError(
        getApiErrorMessage(err, "Не удалось создать администратора")
      );
    }
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setDeleteAdminError(null);
    try {
      await deleteAdminUser.mutateAsync(adminToDelete.id);
      setAdminToDelete(null);
    } catch (err) {
      setDeleteAdminError(
        getApiErrorMessage(err, "Не удалось удалить администратора")
      );
    }
  };

  const isPrimaryAdmin =
    adminUsers && adminUsers.length > 0 && adminUsers[0].id === profile.user_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent" />
        <CardContent className="relative pb-6">
          <Avatar className="absolute -top-12 left-6 h-24 w-24 border-4 border-card">
            <AvatarFallback className="text-2xl bg-amber-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="pt-14 sm:pt-0 sm:pl-32">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">ФИО</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            full_name: e.target.value,
                          }))
                        }
                        placeholder="Введите ФИО"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Должность</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        placeholder="Например: Системный администратор"
                      />
                    </div>
                    {saveError && (
                      <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                        {saveError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Сохранить
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">
                      {profile.full_name || "Не указано"}
                    </h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Администратор
                      </Badge>
                      {profile.position && (
                        <Badge variant="secondary">{profile.position}</Badge>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Редактировать</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Панель управления
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Admin Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/students">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Управление студентами
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Просмотр списка студентов, поиск, фильтрация и управление аккаунтами
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                Перейти <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/reference">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Справочники
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Навыки, интересы и роли для анкеты студентов
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                Перейти <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/shop">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5 text-primary" />
                Магазин
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Добавление товаров и обработка заявок на покупку
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                Перейти <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Admin Users Management (only for primary admin) */}
      {isPrimaryAdmin && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Управление администраторами
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing admins */}
          <div>
            <h3 className="text-sm font-medium mb-2">Существующие администраторы</h3>
            {isAdminsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка списка администраторов...
              </div>
            ) : !adminUsers || adminUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Администраторы не найдены.
              </p>
            ) : (
              <div className="space-y-2">
                {adminUsers.map((admin) => {
                  const isCurrent = admin.id === profile.user_id;
                  return (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs">
                            {(admin.full_name || admin.email)
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {admin.full_name || "Не указано"}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-primary">
                                (вы)
                              </span>
                            )}
                            {!admin.is_active && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (деактивирован)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {admin.email}
                          </p>
                          {admin.position && (
                            <p className="text-xs text-muted-foreground">
                              {admin.position}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={admin.is_active ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {admin.is_active ? "Активен" : "Неактивен"}
                        </Badge>
                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setAdminToDelete(admin)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create new admin */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Добавить администратора</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Новый администратор получит возможность входить в систему со
              своими учётными данными.
            </p>
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="admin_email">Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin_password">Пароль</Label>
                <Input
                  id="admin_password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin_full_name">ФИО (опционально)</Label>
                <Input
                  id="admin_full_name"
                  value={adminForm.full_name}
                  onChange={(e) =>
                    setAdminForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin_position">Должность (опционально)</Label>
                <Input
                  id="admin_position"
                  value={adminForm.position}
                  onChange={(e) =>
                    setAdminForm((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                />
              </div>

              {adminFormError && (
                <div className="md:col-span-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {adminFormError}
                </div>
              )}

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createAdminUser.isPending}
                  className="w-full md:w-auto"
                >
                  {createAdminUser.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Создание администратора...
                    </>
                  ) : (
                    "Добавить администратора"
                  )}
                </Button>
              </div>
            </form>
          </div>
          {deleteAdminError && (
            <p className="text-sm text-destructive">{deleteAdminError}</p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Delete admin dialog */}
      {isPrimaryAdmin && (
        <ConfirmDialog
          open={adminToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleteAdminUser.isPending) {
              setAdminToDelete(null);
              setDeleteAdminError(null);
            }
          }}
          title="Удалить администратора?"
          description={
            adminToDelete
              ? `Вы точно хотите удалить администратора ${
                  adminToDelete.full_name || adminToDelete.email
                }? Его аккаунт будет деактивирован.`
              : "Вы точно хотите удалить этого администратора? Его аккаунт будет деактивирован."
          }
          confirmLabel="Удалить администратора"
          cancelLabel="Отмена"
          variant="destructive"
          onConfirm={handleConfirmDeleteAdmin}
          isLoading={deleteAdminUser.isPending}
        />
      )}
    </div>
  );
}
