import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Stethoscope, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

const AcceptInvite = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const token = searchParams.get('token')

  const [valid, setValid] = useState(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setValid(false)
      setVerifyLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        // FIX: Use api instance + POST endpoint (backend mein POST hai)
        const { data } = await api.post('/auth/verify-invite', { token })
        if (data.valid) {
          setValid(true)
          setEmail(data.email)
        } else {
          setValid(false)
        }
      } catch (err) {
        console.error('Invite verification failed:', err)
        setValid(false)
      } finally {
        setVerifyLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // FIX: Use api instance
      const { data } = await api.post('/auth/accept-invite', {
        token,
        full_name: fullName,
        password
      })

      // Store auth data
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Update auth context
      login(data.user)
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Accept invite failed:', err)
      setError(err.response?.data?.detail || 'Failed to accept invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (verifyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ojas-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="animate-spin text-ojas-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Verifying your invite...</p>
        </div>
      </div>
    )
  }

  // Invalid invite
  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ojas-50 to-blue-100">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Invalid Invite</h2>
          <p className="text-gray-500 mt-2">This invite link is invalid or has expired.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-6 px-4 py-2 bg-ojas-600 text-white rounded-lg hover:bg-ojas-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Success form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ojas-50 to-blue-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-ojas-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Accept Invite</h1>
            <p className="text-gray-500 mt-1">Create your account for <span className="font-medium text-gray-700">{email}</span></p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500 focus:border-transparent"
                placeholder="Dr. Rajesh Kumar" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500 focus:border-transparent"
                placeholder="Min 6 characters" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500 focus:border-transparent"
                placeholder="Repeat password" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-4 py-3 bg-ojas-600 text-white rounded-lg hover:bg-ojas-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Account & Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvite
