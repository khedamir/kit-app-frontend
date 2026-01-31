import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

/**
 * Компонент для редиректа на страницу по умолчанию в зависимости от роли
 */
export function RoleBasedRedirect() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "student":
      return <Navigate to="/home" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

