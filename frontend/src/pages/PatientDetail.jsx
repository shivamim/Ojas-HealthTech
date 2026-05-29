import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePatient } from '../api/hooks'
import RiskBadge from '../components/RiskBadge'
import EscalationCoach from '../components/EscalationCoach'
import { ArrowLeft, Calendar, Phone, Bed, User, Activity, MessageSquare } from 'lucide-react'

const PatientDetail = () => {
  const { id } = useParams()
  const { data: patient, isLoading } = usePatient(id)
  const [activeTab, setActiveTab] = useState('timeline')

  if (isLoading) return <div className="p-6 text-center text-gray-400">Loading...</div>
  if (!patient) return <div className="p-6 text-center text-gray-400">Patient not found</div>

  const tabs = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'checkins', label: 'Check-ins' },
    { id: 'escalations', label: 'Escalations' }
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-ojas-600 mb-4">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
              <RiskBadge score={patient.risk_score} level={patient.risk_level} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User size={14} /> Age {patient.age}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {patient.surgery_type}</span>
              <span className="flex items-center gap-1"><Bed size={14} /> {patient.bed_number}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {patient.mobile}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">UHID</p>
            <p className="font-mono text-sm text-gray-700">{patient.uhid}</p>
            <p className="text-sm text-gray-500 mt-2">Doctor</p>
            <p className="font-medium text-gray-900">{patient.doctor_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{patient.current_day}</p>
            <p className="text-xs text-gray-500">Current Day</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{patient.response_rate?.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Response Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{patient.readmission_risk}</p>
            <p className="text-xs text-gray-500">Readmission Risk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{patient.status}</p>
            <p className="text-xs text-gray-500">Status</p>
          </div>
        </div>
      </div>

      {patient.risk_level === 'CRITICAL' && (
        <EscalationCoach suggestions={[
          "URGENT: Call patient immediately. Verify consciousness and breathing.",
          "Notify Dr. " + patient.doctor_name + " for emergency review.",
          "If patient non-responsive, dispatch ambulance to registered address."
        ]} />
      )}

      <div className="card">
        <div className="flex gap-1 mb-4 border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-ojas-600 text-ojas-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {patient.timeline?.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    t.type === 'ESCALATION' ? 'bg-red-500' :
                    t.type === 'CHECKIN' ? 'bg-green-500' :
                    'bg-ojas-500'
                  }`} />
                  {i < patient.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-sm text-gray-900">{t.title}</p>
                  <p className="text-sm text-gray-500">{t.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Day {t.day}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'checkins' && (
          <div className="grid grid-cols-7 gap-2">
            {patient.checkins?.map(c => (
              <div
                key={c.day}
                className={`p-3 rounded-lg text-center ${
                  c.status === 'COMPLETED' ? 'bg-green-50 border border-green-200' :
                  c.status === 'ESCALATED' ? 'bg-red-50 border border-red-200' :
                  c.status === 'MISSED' ? 'bg-orange-50 border border-orange-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <p className="text-xs text-gray-500">Day {c.day}</p>
                <p className={`text-xs font-medium mt-1 ${
                  c.status === 'COMPLETED' ? 'text-green-700' :
                  c.status === 'ESCALATED' ? 'text-red-700' :
                  c.status === 'MISSED' ? 'text-orange-700' :
                  'text-gray-500'
                }`}>{c.status}</p>
                {c.risk_level !== 'LOW' && (
                  <p className="text-xs mt-1"><RiskBadge level={c.risk_level} size="sm" /></p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'escalations' && (
          <div className="space-y-3">
            {patient.timeline?.filter(t => t.type === 'ESCALATION').map((t, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="font-medium text-red-800">{t.title}</p>
                <p className="text-sm text-red-600 mt-1">{t.description}</p>
              </div>
            )) || <p className="text-gray-400 text-center py-8">No escalations for this patient</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDetail
