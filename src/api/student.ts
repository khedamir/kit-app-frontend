import { apiClient } from "./client";
import type {
  StudentProfile,
  StudentProfileUpdate,
  SkillMap,
  SkillInput,
  RecommendationsResponse,
  RatingResponse,
} from "@/types";

export const studentApi = {
  // Profile
  getProfile: async (): Promise<StudentProfile> => {
    const { data } = await apiClient.get<StudentProfile>("/students/me");
    return data;
  },

  updateProfile: async (
    update: StudentProfileUpdate
  ): Promise<StudentProfile> => {
    const { data } = await apiClient.patch<StudentProfile>(
      "/students/me",
      update
    );
    return data;
  },

  // Skill Map
  getSkillMap: async (): Promise<SkillMap> => {
    const { data } = await apiClient.get<SkillMap>("/students/me/skill-map");
    return data;
  },

  // Questionnaire updates
  updateSkills: async (skills: SkillInput[]): Promise<void> => {
    await apiClient.put("/students/me/skills", skills);
  },

  updateInterests: async (interestIds: number[]): Promise<void> => {
    await apiClient.put("/students/me/interests", interestIds);
  },

  updateRoles: async (roleIds: number[]): Promise<void> => {
    await apiClient.put("/students/me/roles", roleIds);
  },

  // Recommendations
  getRecommendations: async (
    interestsPage = 1,
    interestsPerPage = 20,
    rolesPage = 1,
    rolesPerPage = 20
  ): Promise<RecommendationsResponse> => {
    const { data } = await apiClient.get<RecommendationsResponse>(
      "/students/me/recommendations",
      {
        params: {
          interests_page: interestsPage,
          interests_per_page: interestsPerPage,
          roles_page: rolesPage,
          roles_per_page: rolesPerPage,
        },
      }
    );
    return data;
  },

  // Get student by ID
  getStudentById: async (studentId: number): Promise<SkillMap> => {
    const { data } = await apiClient.get<SkillMap>(`/students/${studentId}`);
    return data;
  },

  // Rating
  getRating: async (page = 1, perPage = 20): Promise<RatingResponse> => {
    const { data } = await apiClient.get<RatingResponse>("/students/rating", {
      params: { page, per_page: perPage },
    });
    return data;
  },
};
