import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { ForumPage } from "@/pages/ForumPage";
import { TopicPage } from "@/pages/TopicPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

      {/* Student Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
