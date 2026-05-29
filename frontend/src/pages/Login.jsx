import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const loginMutation = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await loginMutation.mutateAsync({ email, password })
      login(data.user)
      if (data.user.role === 'SUPER_ADMIN') {
        navigate('/superadmin/hospitals')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ojas-50 to-blue-100">
      <div className="w-full max-w-md p-8">
        <div className="card shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-ojas-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ojas V3</h1>
            <p className="text-gray-500 mt-1">Post-Discharge Recovery Monitoring</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              NABH Compliant
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@ojas.care"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-mono bg-white px-1 rounded border">admin@ojas.care</span> / <span className="font-mono">admin123</span> — Superadmin</p>
              <p><span className="font-mono bg-white px-1 rounded border">nurse@cityhospital.com</span> / <span className="font-mono">nurse123</span> — Coordinator</p>
              <p><span className="font-mono bg-white px-1 rounded border">dr.gupta@cityhospital.com</span> / <span className="font-mono">doctor123</span> — Doctor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
