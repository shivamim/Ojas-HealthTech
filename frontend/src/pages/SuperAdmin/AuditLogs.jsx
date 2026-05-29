import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Download } from 'lucide-react'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/superadmin/audit-logs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false) })
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Complete activity trail for compliance</p>
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Timestamp</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Action</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Resource</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">IP Address</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(l.timestamp).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{l.user_id ? l.user_id.slice(0, 8) : 'System'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{l.action}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{l.resource}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{l.ip_address}</td>
                  <td className="py-3 px-4">
                    {l.success ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle size={12} /> Success</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700"><XCircle size={12} /> Failed</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No audit logs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
