import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'  // ADD THIS

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {  // CHANGED: async add kiya
    try {
      await api.post('/auth/logout')  // ADDED: API call
    } catch (e) {
      console.log('Logout error:', e)
    }
    setUser(null)
    localStorage.clear()
    window.location.href = '/login'
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isHospitalAdmin = user?.role === 'HOSPITAL_ADMIN'
  const isCoordinator = user?.role === 'COORDINATOR'
  const isDoctor = user?.role === 'DOCTOR'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isSuperAdmin, isHospitalAdmin, isCoordinator, isDoctor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
