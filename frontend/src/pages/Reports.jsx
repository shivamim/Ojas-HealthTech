import { useState } from 'react'
import api from '../api/client'
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react'

const Reports = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Format date to YYYY-MM-DD for API
  const formatDate = (dateString) => {
    if (!dateString) return ''
    // If already YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
    
    // Handle DD-MM-YYYY format from date picker
    const parts = dateString.split('-')
    if (parts.length === 3 && parts[0].length === 2) {
      // DD-MM-YYYY → YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const generateReport = async () => {
    setError('')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const formattedStart = formatDate(startDate)
      const formattedEnd = formatDate(endDate)
      
      if (formattedStart) params.append('start_date', formattedStart)
      if (formattedEnd) params.append('end_date', formattedEnd)

      console.log('[Reports] Generating with dates:', { start: formattedStart, end: formattedEnd })

      const response = await api.get(`/reports/nabh?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `nabh_report_${formattedStart || 'all'}_to_${formattedEnd || 'now'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[Reports] Error:', err)
      console.error('[Reports] Response:', err.response)
      console.error('[Reports] Status:', err.response?.status)
      
      if (err.response?.status === 422) {
        setError('Invalid date format. Please use YYYY-MM-DD format.')
      } else if (err.response?.status >= 500) {
        setError('Server error generating report. Please try again.')
      } else if (!err.response) {
        setError('Cannot reach backend. Please check your connection.')
      } else {
        setError(err.response?.data?.detail || 'Failed to generate report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NABH Compliance Reports</h1>
        <p className="text-gray-500 mt-1">Generate post-discharge monitoring compliance PDFs</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <div className="card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={14} /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={14} /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
          </div>
        </div>

        <div className="p-4 bg-ojas-50 rounded-lg border border-ojas-100">
          <div className="flex items-start gap-3">
            <FileText className="text-ojas-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-ojas-900">Report Contents</h4>
              <ul className="text-sm text-ojas-700 mt-2 space-y-1">
                <li>• COP 7.3 — Post-discharge follow-up documentation</li>
                <li>• COP 7.3.1 — 24-48 hour early follow-up rate</li>
                <li>• COP 7.4 — Patient feedback tracking</li>
                <li>• COP 5.6 — Continuity of care documentation</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Download size={18} />
              Generate & Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Reports
