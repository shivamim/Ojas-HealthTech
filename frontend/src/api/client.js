import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor — add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    
    // Prevent infinite loop
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          // Use axios directly (not api instance) to avoid interceptor loop
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { 
            refresh_token: refresh 
          })
          
          localStorage.setItem('access_token', data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          
          return api(original)
        } catch (refreshError) {
          // Refresh failed — clear auth and redirect
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    return Promise.reject(err)
  }
)

export default api
