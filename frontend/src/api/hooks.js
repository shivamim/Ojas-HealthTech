import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

// Helper to check if user is logged in
const isAuthenticated = () => !!localStorage.getItem('access_token')

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },
    retry: false,
    staleTime: Infinity,
    enabled: isAuthenticated() // FIX: Only run if token exists
  })
}

export const useLogin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] })
  })
}

// FIX: Add useLogout hook
export const useLogout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
    onSuccess: () => {
      qc.clear() // Clear all queries
      window.location.href = '/login'
    }
  })
}

export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/hospitals')
      return data
    },
    enabled: false // Manual fetch only
  })
}

export const useCreateHospital = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/superadmin/hospitals', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hospitals'] })
  })
}

export const usePatients = (status = '', page = 1) => {
  return useQuery({
    queryKey: ['patients', status, page],
    queryFn: async () => {
      const { data } = await api.get(`/patients?status=${status}&page=${page}`)
      return data
    }
  })
}

export const usePatient = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`)
      return data
    },
    enabled: !!id
  })
}

export const useCreatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/patients', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] })
  })
}

export const useEscalations = (status = 'OPEN') => {
  return useQuery({
    queryKey: ['escalations', status],
    queryFn: async () => {
      const { data } = await api.get(`/escalations?status=${status}`)
      return data
    }
  })
}

export const useResolveEscalation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }) => api.post(`/escalations/${id}/resolve`, { resolution_note: note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalations'] })
  })
}
