import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Users, Sparkles, Briefcase, Mail, GraduationCap, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRecommendations } from "@/hooks/useStudent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";
import type { StudentRecommendation } from "@/types";

function RecommendationListItem({
  recommendation,
  onStudentClick,
}: {
  recommendation: StudentRecommendation;
  onStudentClick: (studentId: number) => void;
}) {
  const fullName = recommendation.first_name && recommendation.last_name
    ? `${recommendation.first_name} ${recommendation.last_name}`
    : recommendation.email.split("@")[0];
  
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-b-0 cursor-pointer"
      onClick={() => onStudentClick(recommendation.student_id)}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {fullName}
            </h3>
            {recommendation.group_name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                <GraduationCap className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{recommendation.group_name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          {recommendation.match_type === "interests" && recommendation.common_interests && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>{recommendation.common_interests_count}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recommendation.common_interests.slice(0, 3).map((interest, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-primary/20 px-1.5 py-0.5"
                  >
                    {interest}
                  </Badge>
                ))}
                {recommendation.common_interests.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-primary/20 px-1.5 py-0.5"
                  >
                    +{recommendation.common_interests.length - 3}
                  </Badge>
                )}
              </div>
            </>
          )}

          {recommendation.match_type === "roles" && recommendation.roles && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 text-primary" />
                <span>{recommendation.roles_count}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recommendation.roles.slice(0, 3).map((role) => (
                  <Badge
                    key={role.id}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5"
                  >
                    {role.name}
                  </Badge>
                ))}
                {recommendation.roles.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5"
                  >
                    +{recommendation.roles.length - 3}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <a
          href={`mailto:${recommendation.email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1.5 truncate"
        >
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{recommendation.email}</span>
        </a>
      </div>
    </div>
  );
}

function RecommendationsList({
  recommendations,
  emptyMessage,
  pagination,
  onPageChange,
  onStudentClick,
}: {
  recommendations: StudentRecommendation[];
  emptyMessage: string;
  pagination?: {
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  onPageChange?: (page: number) => void;
  onStudentClick: (studentId: number) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {recommendations.map((rec) => (
              <RecommendationListItem
                key={rec.student_id}
                recommendation={rec}
                onStudentClick={onStudentClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.has_prev}
            onClick={() => onPageChange(pagination.page - 1)}
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
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Вперёд
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState("interests");
  const [interestsPage, setInterestsPage] = useState(1);
  const [rolesPage, setRolesPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const perPage = 20;

  const { data: recommendations, isLoading, error } = useRecommendations(
    interestsPage,
    perPage,
    rolesPage,
    perPage
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12">
            <p className="text-destructive">Ошибка загрузки рекомендаций</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const byInterests = recommendations?.recommendations_by_interests || [];
  const byRoles = recommendations?.recommendations_by_roles || [];

  if (byInterests.length === 0 && byRoles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton to="/profile" label="Назад в профиль" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Рекомендации студентов</h1>
          <p className="text-muted-foreground">
            Найди единомышленников и сформируй команду для проектной деятельности
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Нет рекомендаций</h3>
            <p className="text-muted-foreground mb-4">
              Заполните анкету навыков в профиле, чтобы система могла подобрать для вас рекомендации
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Перейти в профиль
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton to="/profile" label="Назад в профиль" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Рекомендации студентов</h1>
        <p className="text-muted-foreground">
          Найди единомышленников и сформируй команду для проектной деятельности
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          // Сбрасываем страницы при переключении табов
          if (value === "interests") {
            setInterestsPage(1);
          } else {
            setRolesPage(1);
          }
          // Сбрасываем скролл при переключении табов
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interests" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">По общим интересам</span>
              <span className="sm:hidden">Интересы</span>
            </span>
            {recommendations?.recommendations_by_interests_pagination?.total ? (
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs px-1 sm:px-1.5 flex-shrink-0">
                {recommendations.recommendations_by_interests_pagination.total}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">По дополняющим ролям</span>
              <span className="sm:hidden">Роли</span>
            </span>
            {recommendations?.recommendations_by_roles_pagination?.total ? (
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs px-1 sm:px-1.5 flex-shrink-0">
                {recommendations.recommendations_by_roles_pagination.total}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interests" className="mt-4">
          <RecommendationsList
            recommendations={byInterests}
            emptyMessage="Заполните свои интересы в профиле, чтобы получить рекомендации"
            pagination={recommendations?.recommendations_by_interests_pagination}
            onPageChange={(page) => {
              setInterestsPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onStudentClick={setSelectedStudentId}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RecommendationsList
            recommendations={byRoles}
            emptyMessage="Заполните свои роли в профиле, чтобы получить рекомендации"
            pagination={recommendations?.recommendations_by_roles_pagination}
            onPageChange={(page) => {
              setRolesPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onStudentClick={setSelectedStudentId}
          />
        </TabsContent>
      </Tabs>

      <StudentDetailDialog
        studentId={selectedStudentId}
        open={selectedStudentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentId(null);
          }
        }}
      />
    </div>
  );
}
