import axios from 'axios'

// In production (Vercel), VITE_API_URL must be set to your Render backend URL
// e.g. https://ojas-backend.onrender.com/api/v1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request interceptor — attach Bearer token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — transparent token refresh on 401 ──────────────
// Queues all failing requests while a refresh is in flight,
// so only ONE refresh call is ever made at a time.
let _refreshing = false
let _queue = []

const processQueue = (error, token = null) => {
  _queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  _queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        _clearAuthAndRedirect()
        return Promise.reject(err)
      }

      if (_refreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          _queue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      _refreshing = true
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refresh },
          { headers: { 'Content-Type': 'application/json' } }
        )
        const newToken = data.access_token
        localStorage.setItem('access_token', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        _clearAuthAndRedirect()
        return Promise.reject(refreshErr)
      } finally {
        _refreshing = false
      }
    }

    return Promise.reject(err)
  }
)

function _clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export default api
