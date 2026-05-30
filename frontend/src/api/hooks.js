import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')  // /api/v1 hatao
      return data
    },
    retry: false,
    staleTime: Infinity
  })
}

export const useLogin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)  // /api/v1 hatao
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] })
  })
}

export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/hospitals')  // /api/v1 hatao
      return data
    },
    enabled: false
  })
}

export const useCreateHospital = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/superadmin/hospitals', data),  // /api/v1 hatao
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hospitals'] })
  })
}

export const usePatients = (status = '', page = 1) => {
  return useQuery({
    queryKey: ['patients', status, page],
    queryFn: async () => {
      const { data } = await api.get(`/patients?status=${status}&page=${page}`)  // /api/v1 hatao
      return data
    }
  })
}

export const usePatient = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`)  // /api/v1 hatao
      return data
    },
    enabled: !!id
  })
}

export const useCreatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/patients', data),  // /api/v1 hatao
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] })
  })
}

export const useEscalations = (status = 'OPEN') => {
  return useQuery({
    queryKey: ['escalations', status],
    queryFn: async () => {
      const { data } = await api.get(`/escalations?status=${status}`)  // /api/v1 hatao
      return data
    }
  })
}

export const useResolveEscalation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }) => api.post(`/escalations/${id}/resolve`, { resolution_note: note }),  // /api/v1 hatao
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalations'] })
  })
}
