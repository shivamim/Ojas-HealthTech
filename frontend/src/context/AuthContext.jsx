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
        console.error('Failed to parse user:', e)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Token already stored in hooks.js useLogin, but ensure consistency
    if (userData.access_token) {
      localStorage.setItem('access_token', userData.access_token)
    }
    if (userData.refresh_token) {
      localStorage.setItem('refresh_token', userData.refresh_token)
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.log('Logout error:', e)
    } finally {
      // FIX: Clear only auth data, not everything
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      setUser(null)
      
      // FIX: Navigate to login after logout
      navigate('/login')
    }
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isHospitalAdmin = user?.role === 'HOSPITAL_ADMIN'
  const isCoordinator = user?.role === 'COORDINATOR'
  const isDoctor = user?.role === 'DOCTOR'

  // Helper to check if user has permission
  const hasRole = (role) => user?.role === role
  const isLoggedIn = !!user

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
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
