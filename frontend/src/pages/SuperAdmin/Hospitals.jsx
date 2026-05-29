import { useState } from 'react'
import { useHospitals, useCreateHospital } from '../../api/hooks'
import { Building2, Plus, Users, Bed, CheckCircle, X } from 'lucide-react'

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

  const handleCreate = async (e) => {
    e.preventDefault()
    await createHospital.mutateAsync(form)
    setShowModal(false)
    setForm({ name: '', city: '', state: '', bed_count: 100, nabh_level: 'Entry Level', contact_email: '', contact_phone: '' })
    refetch()
  }

  const handleInvite = async (hospitalId) => {
    if (!inviteEmail.trim()) return
    // API call to send invite
    await fetch(`/api/v1/superadmin/hospitals/${hospitalId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
      body: JSON.stringify({ email: inviteEmail, role: 'HOSPITAL_ADMIN' })
    })
    setInviteHospitalId(null)
    setInviteEmail('')
    alert('Invite sent!')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-500">Manage all hospitals on Ojas platform</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Add Hospital
        </button>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals?.map(h => (
            <div key={h.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-ojas-100 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-ojas-600" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  h.plan_type === 'professional' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{h.plan_type}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{h.name}</h3>
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
                    className="input text-sm flex-1"
                    placeholder="admin@hospital.com"
                    autoFocus
                  />
                  <button onClick={() => handleInvite(h.id)} className="btn-primary text-sm px-3">Send</button>
                  <button onClick={() => setInviteHospitalId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setInviteHospitalId(h.id)}
                  className="mt-3 text-sm text-ojas-600 hover:text-ojas-700 font-medium"
                >
                  Send Admin Invite
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Hospital</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="Hospital Name" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="input" placeholder="City" required />
                <input value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="input" placeholder="State" required />
              </div>
              <input type="number" value={form.bed_count} onChange={(e) => setForm({...form, bed_count: parseInt(e.target.value)})} className="input" placeholder="Bed Count" />
              <select value={form.nabh_level} onChange={(e) => setForm({...form, nabh_level: e.target.value})} className="input">
                <option>Entry Level</option>
                <option>Full Accreditation</option>
                <option>Pre-Accreditation</option>
              </select>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({...form, contact_email: e.target.value})} className="input" placeholder="Contact Email" required />
              <input value={form.contact_phone} onChange={(e) => setForm({...form, contact_phone: e.target.value})} className="input" placeholder="Contact Phone" required />
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createHospital.isPending} className="btn-primary flex-1 disabled:opacity-50">
                  {createHospital.isPending ? 'Creating...' : 'Create Hospital'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hospitals
