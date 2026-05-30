import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

const isAuthenticated = () => !!localStorage.getItem('access_token')

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },
    retry: false,
    staleTime: Infinity,
    enabled: isAuthenticated()
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
      qc.clear()
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
    enabled: true        // ← FIXED: was false, now auto-fetches
  })
}

export const useCreateHospital = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/superadmin/hospitals', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hospitals'] })
  })
}

export const usePatients = (status = '', page = 1, limit = 20) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  return useQuery({
    queryKey: ['patients', status, page],
    queryFn: async () => {
      const { data } = await api.get(`/patients?${params.toString()}`)
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

export const useAuditLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data } = await api.get(`/superadmin/audit-logs?limit=${limit}`)
      return data
    }
  })
}
