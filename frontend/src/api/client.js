import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,   // ← INCREASED from 15000 to 30000
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

console.log('[Ojas API] Connecting to:', API_URL)

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

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
    if (!err.response) {
      console.error('[API] Network/Timeout error:', err.message, 'Code:', err.code)
      err.isNetworkError = true
      return Promise.reject(err)
    }

    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        _clearAuthAndRedirect()
        return Promise.reject(err)
      }

      if (_refreshing) {
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
