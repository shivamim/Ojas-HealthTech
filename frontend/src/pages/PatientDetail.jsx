import { useParams, Link } from 'react-router-dom'
import { usePatient } from '../api/hooks'
import RiskBadge from '../components/RiskBadge'
import {
  ArrowLeft,
  Calendar,
  Phone,
  Stethoscope,
  BedDouble,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'

const PatientDetail = () => {
  const { id } = useParams()
  const { data: patient, isLoading } = usePatient(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-ojas-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Link to="/patients" className="text-ojas-600 hover:underline mt-2 inline-block">Back to list</Link>
      </div>
    )
  }

  const getCheckinIcon = (status) => {
    if (status === 'COMPLETED') return <CheckCircle size={16} className="text-green-500" />
    if (status === 'MISSED') return <XCircle size={16} className="text-red-500" />
    if (status === 'PENDING') return <HelpCircle size={16} className="text-gray-400" />
    return <HelpCircle size={16} className="text-gray-400" />
  }

  const getCheckinColor = (status, risk) => {
    if (status === 'COMPLETED' && risk === 'CRITICAL') return 'bg-red-50 border-red-200 text-red-700'
    if (status === 'COMPLETED' && risk === 'HIGH') return 'bg-orange-50 border-orange-200 text-orange-700'
    if (status === 'COMPLETED') return 'bg-green-50 border-green-200 text-green-700'
    if (status === 'MISSED') return 'bg-red-50 border-red-100 text-red-600'
    return 'bg-gray-50 border-gray-200 text-gray-500'
  }

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
              <RiskBadge level={patient.risk_level} score={patient.risk_score} />
            </div>
            <p className="text-gray-500 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={14} /> {patient.discharge_date?.split('T')[0]}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {patient.mobile}</span>
              <span className="flex items-center gap-1"><BedDouble size={14} /> Bed {patient.bed_number}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-ojas-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Day</p>
              <p className="text-xl font-bold text-ojas-700">{patient.current_day}<span className="text-sm font-normal text-gray-400">/14</span></p>
            </div>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Response</p>
              <p className="text-xl font-bold text-gray-700">{Math.round(patient.response_rate)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-ojas-600" />
              Medical Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Surgery</span>
                <span className="font-medium text-gray-900">{patient.surgery_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Doctor</span>
                <span className="font-medium text-gray-900">{patient.doctor_name} ({patient.doctor_specialty})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Age</span>
                <span className="font-medium text-gray-900">{patient.age}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">UHID</span>
                <span className="font-medium text-gray-900">{patient.uhid}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Readmission Risk</span>
                <span className={`font-medium ${
                  patient.readmission_risk === 'HIGH' ? 'text-red-600' : 
                  patient.readmission_risk === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                }`}>{patient.readmission_risk}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-ojas-600" />
              Instructions
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-ojas-50 p-3 rounded-lg">
              {patient.instructions}
            </p>
          </div>
        </div>

        {/* Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-ojas-600" />
              14-Day Check-in Timeline
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {patient.checkins?.map((c) => (
                <div
                  key={c.day}
                  className={`p-2 rounded-lg border text-center ${getCheckinColor(c.status, c.risk_level)}`}
                  title={`Day ${c.day}: ${c.status}${c.risk_level ? ` • ${c.risk_level}` : ''}`}
                >
                  <div className="flex justify-center mb-1">{getCheckinIcon(c.status)}</div>
                  <p className="text-xs font-bold">D{c.day}</p>
                  {c.status === 'COMPLETED' && c.risk_level !== 'LOW' && (
                    <p className="text-[10px] mt-0.5 font-medium">{c.risk_level}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Events */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {patient.timeline?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
              )}
              {patient.timeline?.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-ojas-500 rounded-full mt-1.5" />
                    {i !== patient.timeline.length - 1 && <div className="w-px h-full bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Day {t.day}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escalations */}
          {patient.escalations?.length > 0 && (
            <div className="card border-l-4 border-l-red-500">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                Escalations
              </h3>
              <div className="space-y-2">
                {patient.escalations.map((e) => (
                  <div key={e.id} className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">{e.trigger_type} • {e.level}</p>
                      <p className="text-xs text-red-600 mt-0.5">Status: {e.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      e.status === 'OPEN' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
