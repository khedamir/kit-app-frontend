import { apiClient } from "./client";
import type { Skill, SkillCategory, Interest, Role } from "@/types";

export const referencesApi = {
  getSkills: async (): Promise<Skill[]> => {
    const { data } = await apiClient.get<Skill[]>("/skills");
    return data;
  },

  getSkillCategories: async (): Promise<SkillCategory[]> => {
    const { data } = await apiClient.get<SkillCategory[]>("/skill-categories");
    return data;
  },

  getInterests: async (): Promise<Interest[]> => {
    const { data } = await apiClient.get<Interest[]>("/interests");
    return data;
  },

  getRoles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>("/roles");
    return data;
  },
};
