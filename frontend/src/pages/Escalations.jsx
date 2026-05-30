import { useState } from 'react'
import { useEscalations, useResolveEscalation } from '../api/hooks'
import RiskBadge from '../components/RiskBadge'
import EscalationCoach from '../components/EscalationCoach'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  X
} from 'lucide-react'

const Escalations = () => {
  const [status, setStatus] = useState('OPEN')
  const [resolvingId, setResolvingId] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')
  
  const { data: escalations, isLoading } = useEscalations(status)
  const resolveMutation = useResolveEscalation()

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!resolvingId || !resolutionNote.trim()) return
    
    try {
      await resolveMutation.mutateAsync({ id: resolvingId, note: resolutionNote })
      setResolvingId(null)
      setResolutionNote('')
    } catch (err) {
      console.error(err)
    }
  }

  const tabs = [
    { label: 'Open', value: 'OPEN', color: 'text-red-600 bg-red-50' },
    { label: 'Resolved', value: 'RESOLVED', color: 'text-green-600 bg-green-50' },
    { label: 'All', value: '', color: 'text-gray-600 bg-gray-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalation Triage</h1>
          <p className="text-gray-500 mt-1">Review and resolve AI-triggered alerts</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value ? tab.color + ' ring-1 ring-black/5' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-2 border-ojas-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading escalations...</p>
        </div>
      ) : escalations?.length === 0 ? (
        <div className="card text-center py-12">
          <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No {status.toLowerCase()} escalations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalations.map((e) => (
            <div key={e.id} className={`card border-l-4 ${
              e.level === 'CRITICAL' ? 'border-l-red-500' : 'border-l-orange-400'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{e.patient_name}</h3>
                    <RiskBadge level={e.level} score={0} size="sm" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {e.trigger_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{e.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(e.created_at).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><AlertTriangle size={12} /> {e.trigger_detail}</span>
                  </div>
                  
                  <EscalationCoach suggestions={e.suggestions} />
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  {e.status === 'OPEN' ? (
                    <>
                      {resolvingId === e.id ? (
                        <form onSubmit={handleResolve} className="w-full lg:w-80 space-y-2">
                          <textarea
                            autoFocus
                            placeholder="Resolution notes..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            className="input text-sm"
                            rows={2}
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={resolveMutation.isPending}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                            >
                              {resolveMutation.isPending ? 'Saving...' : 'Confirm Resolve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setResolvingId(null)}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setResolvingId(e.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Resolve
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle size={16} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Escalations
