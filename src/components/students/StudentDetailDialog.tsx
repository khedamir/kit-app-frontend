import { Loader2, Mail, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStudentById } from "@/hooks/useStudent";

interface StudentDetailDialogProps {
  studentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailDialog({
  studentId,
  open,
  onOpenChange,
}: StudentDetailDialogProps) {
  const { data: studentData, isLoading, error } = useStudentById(studentId);

  if (!open || !studentId) return null;

  const profile = studentData?.profile;
  const fullName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.email.split("@")[0] || "";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader className="mb-4">
          <DialogTitle>Профиль студента</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !studentData ? (
          <div className="text-center py-12">
            <p className="text-destructive">Ошибка загрузки данных студента</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                {profile?.group_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                    <GraduationCap className="h-4 w-4" />
                    {profile.group_name}
                  </p>
                )}
                <a
                  href={`mailto:${profile?.email}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1.5"
                >
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </a>
              </div>
            </div>

            {/* Роли */}
            {studentData.roles && studentData.roles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Роли</h3>
                <div className="flex flex-wrap gap-2">
                  {studentData.roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Интересы */}
            {studentData.interests && studentData.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Интересы</h3>
                <div className="flex flex-wrap gap-2">
                  {studentData.interests.map((interest) => (
                    <Badge
                      key={interest.id}
                      variant="secondary"
                      className="text-sm bg-primary/10 text-primary border-primary/20 px-3 py-1"
                    >
                      {interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Навыки */}
            {studentData.skills && studentData.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Навыки</h3>
                <div className="space-y-4">
                  {/* Группируем навыки по категориям */}
                  {Object.entries(
                    studentData.skills.reduce(
                      (acc, skill) => {
                        const categoryName = skill.category.name;
                        if (!acc[categoryName]) {
                          acc[categoryName] = [];
                        }
                        acc[categoryName].push(skill);
                        return acc;
                      },
                      {} as Record<string, typeof studentData.skills>
                    )
                  ).map(([categoryName, skills]) => (
                    <div key={categoryName}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {categoryName}
                      </h4>
                      <div className="space-y-2">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <span className="text-sm font-medium">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-2 w-2 rounded-full ${
                                      level <= skill.level
                                        ? "bg-primary"
                                        : "bg-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground w-6 text-right">
                                {skill.level}/5
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Пустое состояние */}
            {(!studentData.roles || studentData.roles.length === 0) &&
              (!studentData.interests || studentData.interests.length === 0) &&
              (!studentData.skills || studentData.skills.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Студент еще не заполнил свой профиль</p>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
