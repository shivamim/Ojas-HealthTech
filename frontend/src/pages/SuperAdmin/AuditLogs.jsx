import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        // FIX: Use api instance (baseURL already has /api/v1)
        const { data } = await api.get('/superadmin/audit-logs')
        setLogs(data)
      } catch (err) {
        console.error('Failed to fetch audit logs:', err)
        setError(err.response?.data?.detail || 'Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'SUPER_ADMIN') {
      fetchLogs()
    } else {
      setError('Access denied. Super Admin only.')
      setLoading(false)
    }
  }, [user])

  const handleExport = () => {
    // CSV export logic
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Status'],
      ...logs.map(l => [
        new Date(l.timestamp).toISOString(),
        l.user_id || 'System',
        l.action,
        l.resource,
        l.ip_address || '-',
        l.success ? 'Success' : 'Failed'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-ojas-600" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Complete activity trail for compliance</p>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Timestamp</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">User ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Action</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Resource</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">IP Address</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                    {new Date(l.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 font-mono">
                    {l.user_id ? `${l.user_id.slice(0, 8)}...` : 'System'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{l.resource}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{l.ip_address || '-'}</td>
                  <td className="py-3 px-4">
                    {l.success ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle size={12} /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Shield size={48} className="mx-auto mb-3 text-gray-300" />
                    No audit logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
