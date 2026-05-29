import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, AlertCircle, CheckCircle } from 'lucide-react'

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

  useEffect(() => {
    if (!token) return
    fetch(`/api/v1/auth/verify-invite?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setValid(true)
          setEmail(data.email)
        } else {
          setValid(false)
        }
      })
      .catch(() => setValid(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
      const res = await fetch('/api/v1/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, full_name: fullName, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        login(data.user)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'Failed to accept invite')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (valid === null) return <div className="min-h-screen flex items-center justify-center text-gray-400">Verifying invite...</div>
  if (valid === false) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Invalid Invite</h2>
        <p className="text-gray-500 mt-2">This invite link is invalid or has expired.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ojas-50 to-blue-100">
      <div className="w-full max-w-md p-8">
        <div className="card shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-ojas-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Accept Invite</h1>
            <p className="text-gray-500">Create your account for {email}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Dr. Rajesh Kumar" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 6 characters" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="Repeat password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account & Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvite
