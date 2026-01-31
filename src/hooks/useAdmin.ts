import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import type { AdminProfileUpdate, AdminStudentsFilters, AddPointsRequest } from "@/types";

export const adminKeys = {
  all: ["admin"] as const,
  profile: () => [...adminKeys.all, "profile"] as const,
  students: () => [...adminKeys.all, "students"] as const,
  studentsList: (filters: AdminStudentsFilters) => [...adminKeys.students(), filters] as const,
  studentGroups: () => [...adminKeys.all, "student-groups"] as const,
  filterSkills: () => [...adminKeys.all, "filter-skills"] as const,
  filterRoles: () => [...adminKeys.all, "filter-roles"] as const,
  filterInterests: () => [...adminKeys.all, "filter-interests"] as const,
  pointCategories: () => [...adminKeys.all, "point-categories"] as const,
};

export function useAdminProfile() {
  return useQuery({
    queryKey: adminKeys.profile(),
    queryFn: adminApi.getProfile,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminProfileUpdate) => adminApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile() });
    },
  });
}

// Student Management
export function useAdminStudents(filters: AdminStudentsFilters = {}) {
  return useQuery({
    queryKey: adminKeys.studentsList(filters),
    queryFn: () => adminApi.getStudents(filters),
  });
}

export function useStudentGroups() {
  return useQuery({
    queryKey: adminKeys.studentGroups(),
    queryFn: adminApi.getStudentGroups,
  });
}

// Filter Options
export function useFilterSkills() {
  return useQuery({
    queryKey: adminKeys.filterSkills(),
    queryFn: adminApi.getFilterSkills,
  });
}

export function useFilterRoles() {
  return useQuery({
    queryKey: adminKeys.filterRoles(),
    queryFn: adminApi.getFilterRoles,
  });
}

export function useFilterInterests() {
  return useQuery({
    queryKey: adminKeys.filterInterests(),
    queryFn: adminApi.getFilterInterests,
  });
}

// Points System
export function usePointCategories() {
  return useQuery({
    queryKey: adminKeys.pointCategories(),
    queryFn: adminApi.getPointCategories,
  });
}

export function useAddStudentPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, request }: { studentId: number; request: AddPointsRequest }) =>
      adminApi.addStudentPoints(studentId, request),
    onSuccess: () => {
      // Инвалидируем список студентов чтобы обновить баллы
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
}

