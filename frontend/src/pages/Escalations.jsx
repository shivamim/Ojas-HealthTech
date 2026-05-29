import { useState } from 'react'
import { useEscalations, useResolveEscalation } from '../api/hooks'
import EscalationCoach from '../components/EscalationCoach'
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react'

const Escalations = () => {
  const [status, setStatus] = useState('OPEN')
  const [resolveId, setResolveId] = useState(null)
  const [note, setNote] = useState('')
  const { data: escalations, isLoading } = useEscalations(status)
  const resolveMutation = useResolveEscalation()

  const handleResolve = async (id) => {
    if (!note.trim()) return
    await resolveMutation.mutateAsync({ id, note })
    setResolveId(null)
    setNote('')
  }

  const statuses = [
    { value: 'OPEN', label: 'Open', color: 'bg-red-100 text-red-700' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-700' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
        <p className="text-gray-500">AI-detected and manually flagged patient concerns</p>
      </div>

      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s.value ? 'bg-ojas-600 text-white' : s.color
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {escalations?.map(e => (
            <div key={e.id} className={`card border-l-4 ${
              e.level === 'CRITICAL' ? 'border-l-red-500' : 'border-l-orange-500'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className={e.level === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'} />
                    <h3 className="font-semibold text-gray-900">{e.patient_name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.level === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>{e.level}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{e.description}</p>
                  <p className="text-xs text-gray-400">Triggered: {e.trigger_detail}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(e.created_at).toLocaleString('en-IN')}
                  </p>

                  {status === 'OPEN' && e.suggestions && (
                    <EscalationCoach suggestions={e.suggestions} />
                  )}
                </div>

                {status === 'OPEN' && (
                  <div className="lg:w-80">
                    {resolveId === e.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="input h-20 text-sm resize-none"
                          placeholder="Resolution note..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(e.id)}
                            disabled={resolveMutation.isPending || !note.trim()}
                            className="btn-primary text-sm py-2 flex-1 disabled:opacity-50"
                          >
                            <CheckCircle size={14} className="inline mr-1" />
                            Resolve
                          </button>
                          <button
                            onClick={() => { setResolveId(null); setNote('') }}
                            className="btn-secondary text-sm py-2 px-3"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolveId(e.id)}
                        className="btn-primary text-sm py-2 w-full"
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}

                {status === 'RESOLVED' && (
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} />
                    Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!escalations || escalations.length === 0) && (
            <div className="card p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No {status.toLowerCase()} escalations</p>
              <p className="text-sm text-gray-400 mt-1">Great — all patients are stable!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Escalations
