import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Eye, EyeOff, AlertCircle, WifiOff, Loader2 } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await loginMutation.mutateAsync({ email, password })
      login(data)
      navigate('/dashboard')
    } catch (err) {
      console.error('[Login] Full error:', err)
      console.error('[Login] Error name:', err.name)
      console.error('[Login] Error message:', err.message)
      console.error('[Login] Error code:', err.code)
      console.error('[Login] Response:', err.response)
      console.error('[Login] Request:', err.request)

      const isTrueNetworkError = !err.response && err.request && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message?.includes('timeout'))
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')

      if (isTrueNetworkError && !isTimeout) {
        setError(
          <span className="flex items-start gap-2">
            <WifiOff size={18} className="mt-0.5 shrink-0" />
            <span>
              <strong>Cannot reach backend.</strong><br />
              <span className="text-xs">Check your internet or backend status.</span>
            </span>
          </span>
        )
      } else if (isTimeout) {
        setError('Request timed out. The server is slow — please try again in a few seconds.')
      } else if (err.response?.status >= 500) {
        setError(`Server error (${err.response.status}). Please try again.`)
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ojas-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ojas-200">
            <Stethoscope className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Ojas</h1>
          <p className="text-gray-500 mt-1">Post-Discharge Recovery Monitoring</p>
        </div>

        <div className="card">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
