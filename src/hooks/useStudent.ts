import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '@/api'
import type { StudentProfileUpdate, SkillInput } from '@/types'

export const studentKeys = {
  all: ['student'] as const,
  profile: () => [...studentKeys.all, 'profile'] as const,
  skillMap: () => [...studentKeys.all, 'skill-map'] as const,
}

export function useStudentProfile() {
  return useQuery({
    queryKey: studentKeys.profile(),
    queryFn: studentApi.getProfile,
  })
}

export function useSkillMap() {
  return useQuery({
    queryKey: studentKeys.skillMap(),
    queryFn: studentApi.getSkillMap,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: StudentProfileUpdate) => studentApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() })
      queryClient.invalidateQueries({ queryKey: studentKeys.skillMap() })
    },
  })
}

export function useUpdateSkills() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (skills: SkillInput[]) => studentApi.updateSkills(skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.skillMap() })
    },
  })
}

export function useUpdateInterests() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (interestIds: number[]) => studentApi.updateInterests(interestIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.skillMap() })
    },
  })
}

export function useUpdateRoles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (roleIds: number[]) => studentApi.updateRoles(roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.skillMap() })
    },
  })
}

