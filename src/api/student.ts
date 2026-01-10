import { apiClient } from "./client";
import type {
  StudentProfile,
  StudentProfileUpdate,
  SkillMap,
  SkillInput,
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
};
