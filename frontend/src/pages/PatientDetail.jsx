import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePatients } from '../api/hooks'
import RiskBadge from '../components/RiskBadge'
import { Search, UserPlus, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const PatientList = () => {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const { data, isLoading } = usePatients(status, page)

  const patients = data?.data || []
  const total = data?.total || 0
  const limit = data?.limit || 20
  const totalPages = Math.ceil(total / limit)

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.surgery_type?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor_name?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Escalated', value: 'ESCALATED' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <Link to="/patients/new" className="btn-primary flex items-center gap-2 self-start">
          <UserPlus size={18} />
          Enroll Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search patients, surgery, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === tab.value
                  ? 'bg-ojas-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-ojas-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No patients found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Surgery</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{p.full_name}</p>
                          <p className="text-xs text-gray-500">Age {p.age} • {p.uhid}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{p.surgery_type}</td>
                      <td className="py-4 px-4 text-gray-600">{p.doctor_name}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-ojas-500 rounded-full"
                              style={{ width: `${(p.current_day / 14) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{p.current_day}/14</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link 
                          to={`/patients/${p.id}`}
                          className="text-ojas-600 hover:text-ojas-700 font-medium text-sm"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PatientList
