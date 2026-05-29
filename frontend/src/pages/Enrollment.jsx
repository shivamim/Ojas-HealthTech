import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePatient } from '../api/hooks'
import { ArrowLeft, User, Phone, Calendar, Bed, Stethoscope, FileText, AlertCircle } from 'lucide-react'

const Enrollment = () => {
  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const [form, setForm] = useState({
    full_name: '', mobile: '', family_mobile: '', age: '',
    surgery_type: '', discharge_date: '', doctor_name: '',
    doctor_specialty: '', bed_number: '', uhid: '', instructions: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createPatient.mutateAsync({
        ...form,
        age: parseInt(form.age),
        discharge_date: form.discharge_date
      })
      navigate('/patients')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll patient')
    }
  }

  const surgeries = [
    'Total Knee Replacement', 'Total Hip Replacement', 'CABG',
    'Laparoscopic Cholecystectomy', 'Appendectomy', 'Hernia Repair',
    'Spinal Surgery', 'Cataract Surgery', 'Other'
  ]

  const specialties = [
    'Orthopedics', 'Cardiac Surgery', 'General Surgery',
    'Neurosurgery', 'Ophthalmology', 'Urology', 'Other'
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate('/patients')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-ojas-600 mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ojas-100 rounded-lg flex items-center justify-center">
            <User size={20} className="text-ojas-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enroll New Patient</h1>
            <p className="text-sm text-gray-500">Start 14-day post-discharge monitoring</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} className="input" placeholder="Patient full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} className="input" placeholder="65" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className="input" placeholder="+91-98765-43210" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Mobile *</label>
              <input name="family_mobile" value={form.family_mobile} onChange={handleChange} className="input" placeholder="+91-98765-43211" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UHID *</label>
              <input name="uhid" value={form.uhid} onChange={handleChange} className="input" placeholder="UHID-2026-0001" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
              <input name="bed_number" value={form.bed_number} onChange={handleChange} className="input" placeholder="Ward-4B-12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surgery Type *</label>
              <select name="surgery_type" value={form.surgery_type} onChange={handleChange} className="input" required>
                <option value="">Select surgery</option>
                {surgeries.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
              <input name="doctor_name" value={form.doctor_name} onChange={handleChange} className="input" placeholder="Dr. Gupta" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <select name="doctor_specialty" value={form.doctor_specialty} onChange={handleChange} className="input" required>
                <option value="">Select specialty</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date *</label>
              <input name="discharge_date" type="date" value={form.discharge_date} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className="input h-24 resize-none"
              placeholder="Post-discharge care instructions..."
              defaultValue="Keep wound dry. Take prescribed medicines. Walk 10 minutes twice daily. Contact if fever > 100F."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createPatient.isPending} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {createPatient.isPending ? 'Enrolling...' : 'Enroll Patient & Start Monitoring'}
            </button>
            <button type="button" onClick={() => navigate('/patients')} className="btn-secondary px-6">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Enrollment
