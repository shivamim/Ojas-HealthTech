import { createContext, useContext, useState, useEffect } from 'react'
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
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  /**
   * Accepts full API response: { access_token, refresh_token, user: {...} }
   * OR just the user object (fallback for any legacy calls)
   */
  const login = (responseOrUser) => {
    let userData, accessToken, refreshToken

    if (responseOrUser?.access_token) {
      // Full API response from Login.jsx
      accessToken  = responseOrUser.access_token
      refreshToken = responseOrUser.refresh_token
      userData     = responseOrUser.user
    } else {
      // Bare user object fallback
      userData     = responseOrUser
      accessToken  = responseOrUser?.access_token
      refreshToken = responseOrUser?.refresh_token
    }

    if (accessToken)  localStorage.setItem('access_token', accessToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore API errors — always clear local state
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      navigate('/login')
    }
  }

  const isSuperAdmin    = user?.role === 'SUPER_ADMIN'
  const isHospitalAdmin = user?.role === 'HOSPITAL_ADMIN'
  const isCoordinator   = user?.role === 'COORDINATOR'
  const isDoctor        = user?.role === 'DOCTOR'
  const hasRole         = (role) => user?.role === role
  const isLoggedIn      = !!user

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isLoggedIn,
      isSuperAdmin,
      isHospitalAdmin,
      isCoordinator,
      isDoctor,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
