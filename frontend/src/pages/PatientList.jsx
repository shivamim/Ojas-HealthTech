import { useState } from 'react'
import { usePatients, useCreatePatient } from '../api/hooks'
import { Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'
import { Search, Plus, Filter, Phone, Bed, Calendar } from 'lucide-react'

const PatientList = () => {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePatients(status, page)
  const createPatient = useCreatePatient()

  const patients = data?.data || []
  const filtered = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.surgery_type?.toLowerCase().includes(search.toLowerCase())
  )

  const statuses = [
    { value: '', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ESCALATED', label: 'Escalated' },
    { value: 'NO_REPLY', label: 'No Reply' },
    { value: 'COMPLETED', label: 'Completed' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage post-discharge recovery monitoring</p>
        </div>
        <Link to="/patients/new" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          Enroll Patient
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s.value
                  ? 'bg-ojas-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-gray-400">Loading patients...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{p.full_name}</h3>
                  <RiskBadge score={p.risk_score} level={p.risk_level} size="sm" />
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {p.surgery_type}</span>
                  <span className="flex items-center gap-1"><Bed size={14} /> Day {p.current_day}/14</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {p.response_rate?.toFixed(0)}% response</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  p.status === 'ESCALATED' ? 'bg-red-100 text-red-700' :
                  p.status === 'NO_REPLY' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{p.status}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  p.readmission_risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                  p.readmission_risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{p.readmission_risk} Risk</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="card p-12 text-center text-gray-400">
              No patients found. Enroll your first patient to get started.
            </div>
          )}
        </div>
      )}

      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(data.total / data.limit)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / data.limit)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PatientList
