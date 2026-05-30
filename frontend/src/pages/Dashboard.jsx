import { useAuth } from '../context/AuthContext'
import { usePatients, useEscalations } from '../api/hooks'
import RiskBadge from '../components/RiskBadge'
import { Link } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  ArrowRight,
  UserPlus,
  FileText
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth()
  const { data: patientsData } = usePatients('', 1, 100)
  const { data: escalationsData } = useEscalations('OPEN')

  const patients = patientsData?.data || []
  const escalations = escalationsData || []
  
  const totalPatients = patientsData?.total || patients.length
  const activeEscalations = escalations.length
  const avgResponse = patients.length > 0 
    ? Math.round(patients.reduce((acc, p) => acc + (p.response_rate || 0), 0) / patients.length) 
    : 0

  const riskDistribution = [
    { name: 'Low', count: patients.filter(p => p.risk_level === 'LOW').length, color: '#22c55e' },
    { name: 'Medium', count: patients.filter(p => p.risk_level === 'MEDIUM').length, color: '#eab308' },
    { name: 'High', count: patients.filter(p => p.risk_level === 'HIGH').length, color: '#f97316' },
    { name: 'Critical', count: patients.filter(p => p.risk_level === 'CRITICAL').length, color: '#ef4444' },
  ]

  const recentPatients = [...patients].sort((a, b) => {
    return new Date(b.discharge_date || 0) - new Date(a.discharge_date || 0)
  }).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name || user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/patients/new" className="btn-primary flex items-center gap-2">
            <UserPlus size={18} />
            <span className="hidden sm:inline">New Patient</span>
          </Link>
          <Link to="/reports" className="btn-secondary flex items-center gap-2">
            <FileText size={18} />
            <span className="hidden sm:inline">Reports</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-ojas-100 rounded-xl flex items-center justify-center">
            <Users className="text-ojas-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            <p className="text-sm text-gray-500">Total Patients</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeEscalations}</p>
            <p className="text-sm text-gray-500">Open Escalations</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Activity className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{avgResponse}%</p>
            <p className="text-sm text-gray-500">Avg Response Rate</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {patients.filter(p => p.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-gray-500">Active Monitoring</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Patients</h3>
            <Link to="/patients" className="text-sm text-ojas-600 hover:text-ojas-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {recentPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No patients enrolled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Surgery</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Day</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Risk</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{p.full_name}</td>
                      <td className="py-3 px-2 text-gray-600">{p.surgery_type}</td>
                      <td className="py-3 px-2 text-gray-600">Day {p.current_day}/14</td>
                      <td className="py-3 px-2">
                        <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link to={`/patients/${p.id}`} className="text-ojas-600 hover:text-ojas-700 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
