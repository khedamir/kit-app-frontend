import { useState } from "react";
import {
  Loader2,
  User,
  Briefcase,
  Sparkles,
  Code2,
  Save,
  Edit3,
  Coins,
  History,
  Map,
  ArrowRight,
  PenLine,
} from "lucide-react";
import { useSkillMap, useUpdateProfile } from "@/hooks/useStudent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QuestionnaireModal } from "@/components/QuestionnaireModal";

export function ProfilePage() {
  const { data: skillMap, isLoading, error } = useSkillMap();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    group_name: "",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !skillMap) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Ошибка загрузки профиля
      </div>
    );
  }

  const { profile, skills, interests, roles } = skillMap;

  const initials =
    profile.first_name && profile.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : profile.email.substring(0, 2).toUpperCase();

  const fullName =
    profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : "Не указано";

  const handleEdit = () => {
    setSaveError(null);
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      group_name: profile.group_name || "",
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

  // Группируем навыки по категориям
  const skillsByCategory = skills.reduce((acc, skill) => {
    const catName = skill.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative pb-6">
          <Avatar className="absolute -top-12 left-6 h-24 w-24 border-4 border-card">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="pt-14 sm:pt-0 sm:pl-32">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Имя</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              first_name: e.target.value,
                            }))
                          }
                          placeholder="Введите имя"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Фамилия</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              last_name: e.target.value,
                            }))
                          }
                          placeholder="Введите фамилию"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group_name">Группа</Label>
                      <Input
                        id="group_name"
                        value={formData.group_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            group_name: e.target.value,
                          }))
                        }
                        placeholder="Например: ИС-11"
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
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                    {profile.group_name && (
                      <Badge variant="secondary" className="mt-2">
                        {profile.group_name}
                      </Badge>
                    )}
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

      {/* Balance & Skill Map Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Баланс</p>
                  <p className="text-2xl font-bold">
                    0{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      сом
                    </span>
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">История</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skill Map Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Карта навыков</p>
                  <p className="text-lg font-medium">Точка роста</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Посмотреть
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questionnaire Section - subtle container */}
      <div className="rounded-xl border border-border/40 bg-muted/20 p-4 sm:p-6 space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Анкета навыков
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuestionnaireOpen(true)}
          >
            <PenLine className="h-4 w-4" />
            Редактировать анкету
          </Button>
        </div>

        {/* Roles & Interests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Roles */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Роли в команде</h3>
            </div>
            {roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Не указаны</p>
            )}
          </div>

          {/* Interests */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Интересы</h3>
            </div>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest.id} variant="outline">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Не указаны</p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Навыки</h3>
          </div>
          {skills.length > 0 ? (
            <div className="space-y-5">
              {Object.entries(skillsByCategory).map(
                ([category, categorySkills]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{skill.name}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-5 h-1.5 rounded-full transition-colors ${
                                  level <= skill.level
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Навыки не указаны</p>
              <p className="text-xs text-muted-foreground mt-1">
                Заполните анкету, чтобы добавить навыки
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        open={isQuestionnaireOpen}
        onOpenChange={setIsQuestionnaireOpen}
        currentRoles={roles}
        currentInterests={interests}
        currentSkills={skills}
      />
    </div>
  );
}
