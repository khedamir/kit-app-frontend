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
  referenceSkillCategories: () => [...adminKeys.all, "reference", "skill-categories"] as const,
  referenceSkills: (categoryId?: number) => [...adminKeys.all, "reference", "skills", categoryId] as const,
  referenceInterests: () => [...adminKeys.all, "reference", "interests"] as const,
  referenceRoles: () => [...adminKeys.all, "reference", "roles"] as const,
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
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
}

// Reference data (skills, interests, roles)
function invalidateReferenceAndFilters(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminKeys.referenceSkillCategories() });
  // Навыки: инвалидируем по префиксу (ключ зависит от categoryId)
  queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "reference", "skills"] });
  queryClient.invalidateQueries({ queryKey: adminKeys.referenceInterests() });
  queryClient.invalidateQueries({ queryKey: adminKeys.referenceRoles() });
  queryClient.invalidateQueries({ queryKey: adminKeys.filterSkills() });
  queryClient.invalidateQueries({ queryKey: adminKeys.filterRoles() });
  queryClient.invalidateQueries({ queryKey: adminKeys.filterInterests() });
  // Принудительный refetch списков навыков и интересов для немедленного обновления UI
  queryClient.refetchQueries({ queryKey: [...adminKeys.all, "reference", "skills"] });
  queryClient.refetchQueries({ queryKey: adminKeys.referenceInterests() });
}

export function useReferenceSkillCategories() {
  return useQuery({
    queryKey: adminKeys.referenceSkillCategories(),
    queryFn: adminApi.getReferenceSkillCategories,
  });
}

export function useReferenceSkills(categoryId?: number) {
  return useQuery({
    queryKey: adminKeys.referenceSkills(categoryId),
    queryFn: () => adminApi.getReferenceSkills(categoryId),
  });
}

export function useReferenceInterests() {
  return useQuery({
    queryKey: adminKeys.referenceInterests(),
    queryFn: adminApi.getReferenceInterests,
  });
}

export function useReferenceRoles() {
  return useQuery({
    queryKey: adminKeys.referenceRoles(),
    queryFn: adminApi.getReferenceRoles,
  });
}

export function useCreateSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => adminApi.createSkillCategory(name),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useDeleteSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: number) => adminApi.deleteSkillCategory(categoryId),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, categoryId }: { name: string; categoryId: number }) =>
      adminApi.createSkill(name, categoryId),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number) => adminApi.deleteSkill(skillId),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useCreateInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => adminApi.createInterest(name),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useDeleteInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestId: number) => adminApi.deleteInterest(interestId),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, name }: { code: string; name: string }) =>
      adminApi.createRole(code, name),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => adminApi.deleteRole(roleId),
    onSuccess: () => invalidateReferenceAndFilters(queryClient),
  });
}

