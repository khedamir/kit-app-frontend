import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password })
        
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)
        
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      register: async (email: string, password: string) => {
        const response = await authApi.register({ email, password })

        if (response.user.role !== 'student') {
          throw new Error('Регистрация доступна только для студентов')
        }

        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null })
          return
        }

        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          // Token invalid
          get().logout()
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

