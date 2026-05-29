import { usePatients, useEscalations } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import RiskBadge from '../components/RiskBadge'
import {
  Users, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Activity, MessageSquare
} from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const { data: patientsData } = usePatients('', 1)
  const { data: escalations } = useEscalations('OPEN')

  const patients = patientsData?.data || []
  const total = patientsData?.total || 0
  const active = patients.filter(p => p.status === 'ACTIVE').length
  const escalated = patients.filter(p => p.status === 'ESCALATED').length
  const noReply = patients.filter(p => p.status === 'NO_REPLY').length
  const completed = patients.filter(p => p.status === 'COMPLETED').length
  const critical = patients.filter(p => p.risk_level === 'CRITICAL').length

  const stats = [
    { icon: Users, label: 'Total Patients', value: total, sub: 'Enrolled this month', color: 'bg-blue-500' },
    { icon: Activity, label: 'Active Monitoring', value: active, sub: 'Currently tracked', color: 'bg-green-500' },
    { icon: AlertTriangle, label: 'Escalations', value: escalated, sub: `${escalations?.length || 0} open`, color: 'bg-red-500' },
    { icon: Clock, label: 'No Reply', value: noReply, sub: 'Family nudges sent', color: 'bg-orange-500' },
    { icon: CheckCircle, label: 'Completed', value: completed, sub: 'Recovery finished', color: 'bg-teal-500' },
    { icon: TrendingUp, label: 'Response Rate', value: `${Math.round(patients.reduce((a, p) => a + (p.response_rate || 0), 0) / (patients.length || 1))}%`, sub: 'Target: >70%', color: 'bg-purple-500' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name || user?.email}</p>
      </div>

      {critical > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="font-semibold text-red-800">{critical} CRITICAL patient(s) need immediate attention</p>
            <p className="text-sm text-red-600">Review escalations immediately</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">High-Risk Patients</h2>
          <span className="text-sm text-gray-500">Sorted by AI Risk Score</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Patient</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Surgery</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Day</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Risk</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Readmission</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients
                .filter(p => ['CRITICAL', 'HIGH'].includes(p.risk_level))
                .sort((a, b) => b.risk_score - a.risk_score)
                .slice(0, 10)
                .map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-900">{p.full_name}</p>
                    <p className="text-xs text-gray-500">Age {p.age}</p>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">{p.surgery_type}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">Day {p.current_day}/14</td>
                  <td className="py-3 px-2"><RiskBadge score={p.risk_score} level={p.risk_level} size="sm" /></td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.readmission_risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                      p.readmission_risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{p.readmission_risk}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      p.status === 'ESCALATED' ? 'bg-red-100 text-red-700' :
                      p.status === 'NO_REPLY' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {patients.filter(p => ['CRITICAL', 'HIGH'].includes(p.risk_level)).length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No high-risk patients — great work!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
