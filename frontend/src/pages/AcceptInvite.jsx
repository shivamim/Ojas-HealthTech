import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api/client'
import { Stethoscope, CheckCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AcceptInvite = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [step, setStep] = useState('verifying') // verifying, form, success
  const [inviteData, setInviteData] = useState(null)
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link. No token provided.')
      setStep('error')
      return
    }

    axios.post(`${API_URL}/auth/verify-invite`, { token })
      .then((res) => {
        setInviteData(res.data)
        setStep('form')
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Invalid or expired invite link.')
        setStep('error')
      })
  }, [token])

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'At least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'At least one uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'At least one lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'At least one digit'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/auth/accept-invite`, {
        token,
        full_name: fullName,
        password
      })

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setStep('success')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept invite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ojas-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Ojas</h1>
        </div>

        <div className="card">
          {step === 'verifying' && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-ojas-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Verifying your invite...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-ojas-50 border border-ojas-100 rounded-lg">
                <p className="text-sm text-gray-600">Invited as</p>
                <p className="font-semibold text-ojas-800">{inviteData?.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">Role: {inviteData?.role}</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Dr. A. Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Min 8 chars, upper, lower, digit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : 'Accept Invite & Join'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Account Created!</h3>
              <p className="text-gray-500 text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AcceptInvite
