import { useState } from 'react'
import api from '../api/client'
import { FileText, Download, Calendar } from 'lucide-react'

const Reports = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/reports/nabh?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `nabh_report_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate report. Please try again.')
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
