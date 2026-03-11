import { AlertTriangle } from "lucide-react";
import { useSkillMap } from "@/hooks/useStudent";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

export function VerificationBanner() {
  const user = useAuthStore((state) => state.user);
  const enabled = !!user && user.role === "student";

  const { data, isLoading, isError } = useSkillMap();

  if (!enabled || isLoading || isError || !data) {
    return null;
  }

  const isVerified = data.profile.is_verified;

  if (isVerified) {
    return null;
  }

  return (
    <div className="border-b border-red-300/70 bg-red-50/95 text-red-900">
      <div className="container mx-auto px-4 py-2 flex items-start gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">
            Аккаунт не подтверждён
          </div>
          <div className="text-xs mt-0.5">
            Заполните профиль (ФИО, группа, дата рождения), чтобы мы могли
            найти вас в базе журнала и привязать данные об успеваемости.
          </div>
        </div>
        <Link
          to="/profile"
          className="text-xs font-medium text-red-900 underline underline-offset-2 whitespace-nowrap"
        >
          Заполнить профиль
        </Link>
      </div>
    </div>
  );
}

