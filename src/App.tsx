import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RecommendationsPage } from "@/pages/RecommendationsPage";
import { ShopPage } from "@/pages/ShopPage";
import { HomePage } from "@/pages/HomePage";
import { StudentsManagementPage } from "@/pages/admin/StudentsManagementPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ForumPage } from "@/pages/ForumPage";
import { TopicPage } from "@/pages/TopicPage";
import { RatingPage } from "@/pages/RatingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Не повторяем запросы при 401/403/404
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response
        ) {
          const status = error.response.status as number;
          if ([401, 403, 404].includes(status)) {
            return false;
          }
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (было cacheTime)
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Глобальная обработка ошибок мутаций
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Mutation error:", error);
        }
      },
    },
  },
});

function AppRoutes() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // checkAuth стабилен, не нужно в зависимостях

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <RoleBasedRedirect /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <RoleBasedRedirect /> : <RegisterPage />}
      />

      {/* Student Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/rating" element={<RatingPage />} />
        <Route path="/shop" element={<ShopPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsManagementPage />} />
      </Route>

      {/* Common Routes (for all authenticated users) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:topicId" element={<TopicPage />} />
      </Route>

      {/* Redirects */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <RoleBasedRedirect />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <RoleBasedRedirect />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  // Определяем base path для React Router (если приложение развёрнуто в поддиректории)
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
