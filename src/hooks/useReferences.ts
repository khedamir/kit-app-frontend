import { useQuery } from '@tanstack/react-query'
import { referencesApi } from '@/api'

export const referenceKeys = {
  all: ['references'] as const,
  skills: () => [...referenceKeys.all, 'skills'] as const,
  skillCategories: () => [...referenceKeys.all, 'skill-categories'] as const,
  interests: () => [...referenceKeys.all, 'interests'] as const,
  roles: () => [...referenceKeys.all, 'roles'] as const,
}

export function useSkills() {
  return useQuery({
    queryKey: referenceKeys.skills(),
    queryFn: referencesApi.getSkills,
    staleTime: 1000 * 60 * 10, // 10 minutes - справочники редко меняются
  })
}

export function useSkillCategories() {
  return useQuery({
    queryKey: referenceKeys.skillCategories(),
    queryFn: referencesApi.getSkillCategories,
    staleTime: 1000 * 60 * 10,
  })
}

export function useInterests() {
  return useQuery({
    queryKey: referenceKeys.interests(),
    queryFn: referencesApi.getInterests,
    staleTime: 1000 * 60 * 10,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: referenceKeys.roles(),
    queryFn: referencesApi.getRoles,
    staleTime: 1000 * 60 * 10,
  })
}

