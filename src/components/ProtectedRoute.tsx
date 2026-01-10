import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если указаны разрешённые роли и текущая роль не входит в них
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Редирект на страницу соответствующую роли пользователя
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "student") {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
