import { apiClient } from "./client";
import type {
  AdminProfile,
  AdminProfileUpdate,
  AdminStudentsResponse,
  AdminStudentsFilters,
  FilterSkillCategory,
  FilterRole,
  FilterInterest,
  PointCategory,
  AddPointsRequest,
  AddPointsResponse,
} from "@/types";

export const adminApi = {
  getProfile: async (): Promise<AdminProfile> => {
    const { data } = await apiClient.get<AdminProfile>("/admins/me");
    return data;
  },

  updateProfile: async (update: AdminProfileUpdate): Promise<AdminProfile> => {
    const { data } = await apiClient.patch<AdminProfile>("/admins/me", update);
    return data;
  },

  // Student Management
  getStudents: async (filters: AdminStudentsFilters = {}): Promise<AdminStudentsResponse> => {
    const params: Record<string, string | number | boolean> = {};
    
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;
    if (filters.search) params.search = filters.search;
    if (filters.group) params.group = filters.group;
    if (filters.has_profile !== undefined) params.has_profile = filters.has_profile;
    if (filters.has_skills !== undefined) params.has_skills = filters.has_skills;
    if (filters.skill_id) params.skill_id = filters.skill_id;
    if (filters.role_id) params.role_id = filters.role_id;
    if (filters.interest_id) params.interest_id = filters.interest_id;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.sort_order) params.sort_order = filters.sort_order;

    const { data } = await apiClient.get<AdminStudentsResponse>("/admins/students", { params });
    return data;
  },

  getStudentGroups: async (): Promise<{ groups: string[] }> => {
    const { data } = await apiClient.get<{ groups: string[] }>("/admins/students/groups");
    return data;
  },

  // Filter Options
  getFilterSkills: async (): Promise<{ skill_categories: FilterSkillCategory[] }> => {
    const { data } = await apiClient.get<{ skill_categories: FilterSkillCategory[] }>("/admins/filters/skills");
    return data;
  },

  getFilterRoles: async (): Promise<{ roles: FilterRole[] }> => {
    const { data } = await apiClient.get<{ roles: FilterRole[] }>("/admins/filters/roles");
    return data;
  },

  getFilterInterests: async (): Promise<{ interests: FilterInterest[] }> => {
    const { data } = await apiClient.get<{ interests: FilterInterest[] }>("/admins/filters/interests");
    return data;
  },

  // Points System
  getPointCategories: async (): Promise<{ categories: PointCategory[] }> => {
    const { data } = await apiClient.get<{ categories: PointCategory[] }>("/admins/points/categories");
    return data;
  },

  addStudentPoints: async (studentId: number, request: AddPointsRequest): Promise<AddPointsResponse> => {
    const { data } = await apiClient.post<AddPointsResponse>(
      `/admins/students/${studentId}/points`,
      request
    );
    return data;
  },
};

