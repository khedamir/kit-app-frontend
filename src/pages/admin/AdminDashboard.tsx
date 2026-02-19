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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/useAdmin";

export function AdminDashboard() {
  const { data: profile, isLoading, error } = useAdminProfile();
  const updateProfile = useUpdateAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
  });

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
      </div>
    </div>
  );
}
