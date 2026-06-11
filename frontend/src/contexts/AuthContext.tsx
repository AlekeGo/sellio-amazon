import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../lib/api'

interface User {
  id: number
  email: string
  full_name: string
  avatar_url: string | null
  provider: string | null
  created_at: string
  email_verified: boolean
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
  googleLogin: (credential: string) => Promise<void>
  updateProfile: (data: { full_name: string }) => Promise<void>
  verifyEmail: (code: string) => Promise<void>
  resendVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function storeTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    const { data } = await api.get<User>('/auth/me/')
    setUser(data)
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .catch(() => {
        clearTokens()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login/', { email, password })
    storeTokens(data.access, data.refresh)
    setUser(data.user)
  }

  const register = async (email: string, password: string, full_name: string) => {
    const { data } = await api.post('/auth/register/', { email, password, full_name })
    storeTokens(data.access, data.refresh)
    setUser(data.user)
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  const googleLogin = async (credential: string) => {
    const { data } = await api.post('/auth/google/', { credential })
    storeTokens(data.access, data.refresh)
    setUser(data.user)
  }

  const updateProfile = async (profileData: { full_name: string }) => {
    const { data } = await api.patch<User>('/auth/me/', profileData)
    setUser(data)
  }

  const verifyEmail = async (code: string) => {
    await api.post('/auth/verify-email/', { code })
    await fetchMe()
  }

  const resendVerification = async () => {
    await api.post('/auth/resend-verification/')
  }

  return (
    <AuthContext.Provider
      value={{
        user, isAuthenticated: !!user, loading,
        login, register, logout, googleLogin, updateProfile,
        verifyEmail, resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
