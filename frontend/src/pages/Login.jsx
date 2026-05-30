import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Eye, EyeOff, AlertCircle, WifiOff } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

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
      if (err.isNetworkError || !err.response) {
        setError(
          <span className="flex items-start gap-2">
            <WifiOff size={18} className="mt-0.5 shrink-0" />
            <span>
              <strong>Cannot reach backend.</strong><br />
              API URL: <code className="bg-red-100 px-1 rounded text-xs">{API_URL}</code><br />
              <span className="text-xs">Set VITE_API_URL in Vercel and redeploy.</span>
            </span>
          </span>
        )
      } else {
        setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
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
                placeholder="admin@ojas.care"
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
                  placeholder="••••••••"
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
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500 text-center">
              Demo: <span className="font-medium">admin@ojas.care</span> / <span className="font-medium">admin123</span>
            </p>
            <p className="text-[10px] text-gray-400 text-center font-mono">
              API: {API_URL}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
