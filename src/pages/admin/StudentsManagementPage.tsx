import { useState, useMemo } from "react";
import {
  Loader2,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  GraduationCap,
  Mail,
  Sparkles,
  Briefcase,
  Code2,
  ArrowUpDown,
  Award,
  Coins,
  Edit3,
} from "lucide-react";
import {
  useAdminStudents,
  useStudentGroups,
  useFilterSkills,
  useFilterRoles,
  useFilterInterests,
} from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { BackButton } from "@/components/ui/back-button";
import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";
import { ChangePointsDialog } from "@/components/admin/ChangePointsDialog";
import type { AdminStudentsFilters, AdminStudentItem } from "@/types";

function StudentRow({
  student,
  onSelect,
  onChangePoints,
}: {
  student: AdminStudentItem;
  onSelect: (id: number) => void;
  onChangePoints: (student: AdminStudentItem) => void;
}) {
  const fullName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : null;

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : student.email.substring(0, 2).toUpperCase();

  const hasProfile = !!fullName;

  return (
    <div
      className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => student.id && onSelect(student.id)}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback
          className={`${hasProfile ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} font-semibold text-sm`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3">
        {/* Имя и email */}
        <div className="min-w-0">
          <p className="font-medium truncate">{fullName || "Не указано"}</p>
          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
            <Mail className="h-3 w-3 flex-shrink-0" />
            {student.email}
          </p>
        </div>

        {/* Группа */}
        <div className="min-w-0 hidden sm:block">
          {student.group_name ? (
            <p className="text-sm flex items-center gap-1 truncate">
              <GraduationCap className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              {student.group_name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
          {student.created_at && (
            <p className="text-xs text-muted-foreground">
              {new Date(student.created_at).toLocaleDateString("ru-RU")}
            </p>
          )}
        </div>

        {/* Баллы и SOM */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{student.total_points}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Coins className="h-4 w-4 text-green-500" />
            <span className="font-medium">{student.total_som}</span>
          </div>
        </div>

        {/* Бейджи навыков */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant={student.skills_count > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            <Code2 className="h-3 w-3 mr-1" />
            {student.skills_count}
          </Badge>
          <Badge
            variant={student.interests_count > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {student.interests_count}
          </Badge>
          <Badge
            variant={student.roles_count > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            {student.roles_count}
          </Badge>
        </div>
      </div>

      {/* Кнопка изменения баллов */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onChangePoints(student);
        }}
      >
        <Edit3 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Баллы</span>
      </Button>
    </div>
  );
}

export function StudentsManagementPage() {
  const [filters, setFilters] = useState<AdminStudentsFilters>({
    page: 1,
    per_page: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState<AdminStudentItem | null>(null);

  const { data, isLoading, error, refetch } = useAdminStudents(filters);
  const { data: groupsData } = useStudentGroups();
  const { data: skillsData } = useFilterSkills();
  const { data: rolesData } = useFilterRoles();
  const { data: interestsData } = useFilterInterests();

  const students = data?.students || [];
  const pagination = data?.pagination;
  const groups = groupsData?.groups || [];

  // Options for selects
  const groupOptions = useMemo(() => [
    { value: "all", label: "Все группы" },
    ...groups.map((g) => ({ value: g, label: g })),
  ], [groups]);

  const profileOptions = [
    { value: "all", label: "Все" },
    { value: "yes", label: "Да" },
    { value: "no", label: "Нет" },
  ];

  const hasSkillsOptions = [
    { value: "all", label: "Все" },
    { value: "yes", label: "Да" },
    { value: "no", label: "Нет" },
  ];

  // Flatten skills with category names
  const skillOptions = useMemo(() => {
    const options = [{ value: "all", label: "Все навыки" }];
    skillsData?.skill_categories.forEach((cat) => {
      cat.skills.forEach((skill) => {
        options.push({
          value: String(skill.id),
          label: `${skill.name} (${cat.category.name})`,
        });
      });
    });
    return options;
  }, [skillsData]);

  const roleOptions = useMemo(() => [
    { value: "all", label: "Все роли" },
    ...(rolesData?.roles || []).map((r) => ({
      value: String(r.id),
      label: r.name,
    })),
  ], [rolesData]);

  const interestOptions = useMemo(() => [
    { value: "all", label: "Все интересы" },
    ...(interestsData?.interests || []).map((i) => ({
      value: String(i.id),
      label: i.name,
    })),
  ], [interestsData]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      per_page: 20,
      sort_by: "created_at",
      sort_order: "desc",
    });
    setSearchInput("");
  };

  const hasActiveFilters =
    filters.search ||
    filters.group ||
    filters.has_profile !== undefined ||
    filters.has_skills !== undefined ||
    filters.skill_id !== undefined ||
    filters.role_id !== undefined ||
    filters.interest_id !== undefined;

  return (
    <div className="space-y-6">
      <BackButton to="/admin" label="Назад в панель" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление студентами</h1>
        <p className="text-muted-foreground">
          Просматривайте и управляйте аккаунтами студентов
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по email, имени, фамилии..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Найти</Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Фильтры
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Row 1: Basic filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Group Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Группа</label>
                  <Select
                    value={filters.group || "all"}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        group: value === "all" ? undefined : value,
                        page: 1,
                      }))
                    }
                    options={groupOptions}
                    placeholder="Все группы"
                  />
                </div>

                {/* Profile Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Профиль заполнен
                  </label>
                  <Select
                    value={
                      filters.has_profile === undefined
                        ? "all"
                        : filters.has_profile
                          ? "yes"
                          : "no"
                    }
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        has_profile:
                          value === "all" ? undefined : value === "yes",
                        page: 1,
                      }))
                    }
                    options={profileOptions}
                  />
                </div>

                {/* Has Skills Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Есть навыки
                  </label>
                  <Select
                    value={
                      filters.has_skills === undefined
                        ? "all"
                        : filters.has_skills
                          ? "yes"
                          : "no"
                    }
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        has_skills:
                          value === "all" ? undefined : value === "yes",
                        page: 1,
                      }))
                    }
                    options={hasSkillsOptions}
                  />
                </div>
              </div>

              {/* Row 2: Specific filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Skill Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5" />
                    Навык
                  </label>
                  <Select
                    value={filters.skill_id ? String(filters.skill_id) : "all"}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        skill_id: value === "all" ? undefined : Number(value),
                        page: 1,
                      }))
                    }
                    options={skillOptions}
                    placeholder="Все навыки"
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Роль в команде
                  </label>
                  <Select
                    value={filters.role_id ? String(filters.role_id) : "all"}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        role_id: value === "all" ? undefined : Number(value),
                        page: 1,
                      }))
                    }
                    options={roleOptions}
                    placeholder="Все роли"
                  />
                </div>

                {/* Interest Filter */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Интерес
                  </label>
                  <Select
                    value={filters.interest_id ? String(filters.interest_id) : "all"}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        interest_id: value === "all" ? undefined : Number(value),
                        page: 1,
                      }))
                    }
                    options={interestOptions}
                    placeholder="Все интересы"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Ошибка загрузки списка студентов</p>
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Студенты не найдены</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "В системе пока нет зарегистрированных студентов"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats and Sort */}
          <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
            <span>
              Найдено: <strong className="text-foreground">{pagination?.total || 0}</strong> студентов
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={filters.sort_by || "created_at"}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort_by: value as AdminStudentsFilters["sort_by"],
                    page: 1,
                  }))
                }
                options={[
                  { value: "created_at", label: "По дате" },
                  { value: "total_points", label: "По баллам" },
                  { value: "total_som", label: "По SOM" },
                  { value: "first_name", label: "По имени" },
                  { value: "email", label: "По email" },
                ]}
                className="min-w-[140px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sort_order: prev.sort_order === "desc" ? "asc" : "desc",
                  }))
                }
                className="gap-1"
              >
                <ArrowUpDown className="h-4 w-4" />
                {filters.sort_order === "desc" ? "↓" : "↑"}
              </Button>
            </div>
          </div>

          {/* Students List */}
          <Card>
            <CardContent className="p-0">
              {students.map((student) => (
                <StudentRow
                  key={student.user_id}
                  student={student}
                  onSelect={setSelectedStudentId}
                  onChangePoints={setSelectedStudentForPoints}
                />
              ))}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>

              <span className="text-sm text-muted-foreground px-4">
                {pagination.page} из {pagination.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                }
              >
                Вперёд
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Student Detail Dialog */}
      <StudentDetailDialog
        studentId={selectedStudentId}
        open={selectedStudentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null);
        }}
      />

      {/* Change Points Dialog */}
      <ChangePointsDialog
        student={selectedStudentForPoints}
        open={selectedStudentForPoints !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentForPoints(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
