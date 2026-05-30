import { useState, useEffect } from 'react'
import { useHospitals, useCreateHospital } from '../../api/hooks'
import api from '../../api/client'
import { Building2, Plus, Users, Bed, CheckCircle, X, Loader2, Mail, Send } from 'lucide-react'

const Hospitals = () => {
  const { data: hospitals, isLoading, refetch } = useHospitals()
  const createHospital = useCreateHospital()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', state: '', bed_count: 100,
    nabh_level: 'Entry Level', contact_email: '', contact_phone: ''
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteHospitalId, setInviteHospitalId] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [error, setError] = useState(null)

  // FIX: Auto-fetch on mount (useHospitals has enabled: false)
  useEffect(() => {
    refetch()
  }, [refetch])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createHospital.mutateAsync(form)
      setShowModal(false)
      setForm({ name: '', city: '', state: '', bed_count: 100, nabh_level: 'Entry Level', contact_email: '', contact_phone: '' })
      refetch()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create hospital')
    }
  }

  const handleInvite = async (hospitalId) => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setError(null)
    try {
      // FIX: Use api instance instead of fetch
      await api.post(`/superadmin/hospitals/${hospitalId}/invite`, {
        email: inviteEmail,
        role: 'HOSPITAL_ADMIN'
      })
      setInviteSuccess('Invite sent successfully!')
      setInviteHospitalId(null)
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invite')
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Toast */}
      {inviteSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle size={18} />
          {inviteSuccess}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <X size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-500">Manage all hospitals on Ojas platform</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-ojas-600 text-white rounded-lg hover:bg-ojas-700 transition-colors font-medium"
        >
          <Plus size={18} /> Add Hospital
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-ojas-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals?.map(h => (
            <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-ojas-100 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-ojas-600" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  h.plan_type === 'professional' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{h.plan_type}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{h.name}</h3>
              <p className="text-sm text-gray-500">{h.city}, {h.state}</p>
              <div className="flex gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Bed size={14} /> {h.bed_count} beds</span>
                <span className="flex items-center gap-1"><Users size={14} /> {h.patient_count} patients</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">NABH: {h.nabh_level}</p>

              {inviteHospitalId === h.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ojas-500 focus:border-transparent"
                    placeholder="admin@hospital.com"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleInvite(h.id)} 
                    disabled={inviteLoading}
                    className="px-3 py-2 bg-ojas-600 text-white rounded-lg text-sm hover:bg-ojas-700 disabled:opacity-50"
                  >
                    {inviteLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                  <button 
                    onClick={() => setInviteHospitalId(null)} 
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setInviteHospitalId(h.id)}
                  className="mt-3 text-sm text-ojas-600 hover:text-ojas-700 font-medium inline-flex items-center gap-1"
                >
                  <Mail size={14} /> Send Admin Invite
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Hospital</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input 
                name="name" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500 focus:border-transparent"
                placeholder="Hospital Name" 
                required 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  value={form.city} 
                  onChange={(e) => setForm({...form, city: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
                  placeholder="City" 
                  required 
                />
                <input 
                  value={form.state} 
                  onChange={(e) => setForm({...form, state: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
                  placeholder="State" 
                  required 
                />
              </div>
              <input 
                type="number" 
                value={form.bed_count} 
                onChange={(e) => setForm({...form, bed_count: parseInt(e.target.value)})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
                placeholder="Bed Count" 
              />
              <select 
                value={form.nabh_level} 
                onChange={(e) => setForm({...form, nabh_level: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
              >
                <option>Entry Level</option>
                <option>Full Accreditation</option>
                <option>Pre-Accreditation</option>
              </select>
              <input 
                type="email" 
                value={form.contact_email} 
                onChange={(e) => setForm({...form, contact_email: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
                placeholder="Contact Email" 
                required 
              />
              <input 
                value={form.contact_phone} 
                onChange={(e) => setForm({...form, contact_phone: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ojas-500"
                placeholder="Contact Phone" 
                required 
              />
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={createHospital.isPending} 
                  className="flex-1 px-4 py-2 bg-ojas-600 text-white rounded-lg hover:bg-ojas-700 disabled:opacity-50 font-medium"
                >
                  {createHospital.isPending ? 'Creating...' : 'Create Hospital'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hospitals
