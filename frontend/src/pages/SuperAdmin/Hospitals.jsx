import { useState } from 'react'
import { useHospitals, useCreateHospital } from '../../api/hooks'
import { Building2, Plus, Users, BedDouble, Mail } from 'lucide-react'

const Hospitals = () => {
  const { data: hospitals, isLoading, refetch } = useHospitals()
  const createMutation = useCreateHospital()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    bed_count: 100,
    nabh_level: 'Entry Level',
    contact_email: '',
    contact_phone: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      setShowForm(false)
      setForm({ name: '', city: '', state: '', bed_count: 100, nabh_level: 'Entry Level', contact_email: '', contact_phone: '' })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-500 mt-1">Manage hospitals and generate invites</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={18} />
          Add Hospital
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold text-gray-900">New Hospital</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Hospital Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            <input name="city" placeholder="City" required value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} className="input" />
            <input name="state" placeholder="State" required value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} className="input" />
            <input name="contact_email" type="email" placeholder="Contact Email" required value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} className="input" />
            <input name="contact_phone" placeholder="Contact Phone" required value={form.contact_phone} onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))} className="input" />
            <input name="bed_count" type="number" placeholder="Beds" value={form.bed_count} onChange={(e) => setForm(f => ({ ...f, bed_count: parseInt(e.target.value) || 0 }))} className="input" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary disabled:opacity-60">
              {createMutation.isPending ? 'Creating...' : 'Create Hospital'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-2 border-ojas-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals?.map((h) => (
            <div key={h.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-ojas-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-ojas-600" size={20} />
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{h.nabh_level}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{h.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{h.city}, {h.state}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} />
                  <span>{h.patient_count || 0} patients</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BedDouble size={14} />
                  <span>{h.bed_count} beds</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Hospitals
