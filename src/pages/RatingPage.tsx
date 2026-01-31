import { useState } from "react";
import {
  Loader2,
  Trophy,
  Award,
  Coins,
  ChevronLeft,
  ChevronRight,
  Medal,
  Crown,
  User,
} from "lucide-react";
import { useRating, useSkillMap } from "@/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RatingStudent } from "@/types";

export function RatingPage() {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, error } = useRating(page, perPage);
  const { data: skillMap } = useSkillMap();
  
  // ID профиля текущего пользователя
  const currentProfileId = skillMap?.profile?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Ошибка загрузки рейтинга
      </div>
    );
  }

  const { students, pagination } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Рейтинг студентов
        </h1>
        <p className="text-muted-foreground mt-1">
          Топ студентов по количеству баллов за учебный год
        </p>
      </div>

      {/* Top 3 Podium (only on first page) */}
      {page === 1 && students.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* 2nd place */}
          <PodiumCard student={students[1]} place={2} isCurrentUser={students[1].id === currentProfileId} />
          {/* 1st place */}
          <PodiumCard student={students[0]} place={1} isCurrentUser={students[0].id === currentProfileId} />
          {/* 3rd place */}
          <PodiumCard student={students[2]} place={3} isCurrentUser={students[2].id === currentProfileId} />
        </div>
      )}

      {/* Rating List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Все участники</span>
            <span className="text-sm font-normal text-muted-foreground">
              Всего: {pagination.total}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {students.map((student) => (
              <StudentRow 
                key={student.id} 
                student={student} 
                isCurrentUser={student.id === currentProfileId}
              />
            ))}

            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Пока нет участников рейтинга
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {page} / {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Podium Card for Top 3
function PodiumCard({ student, place, isCurrentUser }: { student: RatingStudent; place: 1 | 2 | 3; isCurrentUser?: boolean }) {
  const initials =
    student.first_name && student.last_name
      ? `${student.first_name[0]}${student.last_name[0]}`
      : "??";

  const fullName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : "Неизвестно";

  const placeConfig = {
    1: {
      icon: Crown,
      bg: "bg-gradient-to-br from-amber-400 to-amber-600",
      border: "border-amber-400",
      iconColor: "text-amber-400",
      height: "pt-4",
      avatarSize: "h-16 w-16 sm:h-20 sm:w-20",
      order: "order-2",
    },
    2: {
      icon: Medal,
      bg: "bg-gradient-to-br from-slate-300 to-slate-500",
      border: "border-slate-400",
      iconColor: "text-slate-400",
      height: "pt-8",
      avatarSize: "h-14 w-14 sm:h-16 sm:w-16",
      order: "order-1",
    },
    3: {
      icon: Medal,
      bg: "bg-gradient-to-br from-amber-600 to-amber-800",
      border: "border-amber-700",
      iconColor: "text-amber-700",
      height: "pt-10",
      avatarSize: "h-12 w-12 sm:h-14 sm:w-14",
      order: "order-3",
    },
  };

  const config = placeConfig[place];
  const Icon = config.icon;

  return (
    <Card className={cn(
      "overflow-hidden", 
      config.order,
      isCurrentUser && "bg-primary/10"
    )}>
      <CardContent className={cn("flex flex-col items-center text-center p-3 sm:p-4", config.height)}>
        <div className="relative">
          <Avatar className={cn("border-4", config.avatarSize, config.border)}>
            <AvatarFallback className={cn("text-white font-bold", config.bg)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
            config.bg
          )}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="font-semibold text-sm sm:text-base line-clamp-1">{fullName}</p>
          {isCurrentUser ? (
            <Badge variant="default" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Вы
            </Badge>
          ) : student.group_name ? (
            <Badge variant="secondary" className="text-xs">
              {student.group_name}
            </Badge>
          ) : null}
        </div>

        <div className="mt-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-lg sm:text-xl">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            {student.total_points}
          </div>
          <div className="flex items-center gap-1 text-green-500 text-xs sm:text-sm">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
            {student.total_som} SOM
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Student Row
function StudentRow({ student, isCurrentUser }: { student: RatingStudent; isCurrentUser?: boolean }) {
  const initials =
    student.first_name && student.last_name
      ? `${student.first_name[0]}${student.last_name[0]}`
      : "??";

  const fullName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : "Неизвестно";

  const isTop3 = student.rank <= 3;

  const rankBadge = () => {
    if (student.rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <Crown className="h-4 w-4 text-white" />
        </div>
      );
    }
    if (student.rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">2</span>
        </div>
      );
    }
    if (student.rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
          <span className="text-white font-bold text-sm">3</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <span className="font-medium text-sm text-muted-foreground">{student.rank}</span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted/50 transition-colors",
        isTop3 && "bg-muted/30",
        isCurrentUser && "bg-primary/10 border-l-4 border-l-primary"
      )}
    >
      {rankBadge()}

      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn(
          isCurrentUser ? "bg-primary text-primary-foreground" : isTop3 ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium truncate", (isTop3 || isCurrentUser) && "font-semibold")}>
            {fullName}
          </p>
          {isCurrentUser && (
            <Badge variant="default" className="text-xs shrink-0">
              <User className="h-3 w-3 mr-1" />
              Вы
            </Badge>
          )}
        </div>
        {student.group_name && (
          <p className="text-xs text-muted-foreground">{student.group_name}</p>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1 text-amber-500">
          <Award className="h-4 w-4" />
          <span className="font-semibold">{student.total_points}</span>
        </div>
        <div className="flex items-center gap-1 text-green-500 text-sm">
          <Coins className="h-3.5 w-3.5" />
          <span>{student.total_som}</span>
        </div>
      </div>
    </div>
  );
}
