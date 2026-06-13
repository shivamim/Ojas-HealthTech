import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Failed to parse stored user:', e)
        }
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // FIX: useCallback prevents unnecessary re-renders of child components
  const login = useCallback((responseOrUser) => {
    let userData, accessToken, refreshToken

    if (responseOrUser?.access_token) {
      accessToken = responseOrUser.access_token
      refreshToken = responseOrUser.refresh_token
      userData = responseOrUser.user
    } else {
      userData = responseOrUser
      accessToken = responseOrUser?.access_token
      refreshToken = responseOrUser?.refresh_token
    }

    if (accessToken) localStorage.setItem('access_token', accessToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  // FIX: useCallback for stable function reference
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore - we logout locally regardless
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      navigate('/login')
    }
  }, [navigate])

  // FIX: useMemo prevents all consumers from re-rendering when any state changes
  // Only re-computes when user or loading actually changes
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isLoggedIn: !!user,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isHospitalAdmin: user?.role === 'HOSPITAL_ADMIN',
    isCoordinator: user?.role === 'COORDINATOR',
    isDoctor: user?.role === 'DOCTOR',
    hasRole: (role) => user?.role === role,
  }), [user, loading, login, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
