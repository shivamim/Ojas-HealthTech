import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePatient } from '../api/hooks'
import { ArrowLeft, CheckCircle, UserPlus } from 'lucide-react'

const Enrollment = () => {
  const navigate = useNavigate()
  const createMutation = useCreatePatient()
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    family_mobile: '',
    age: '',
    surgery_type: '',
    discharge_date: '',
    doctor_name: '',
    doctor_specialty: '',
    bed_number: '',
    uhid: '',
    instructions: 'Keep wound dry. Take prescribed medicines. Walk daily.'
  })

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      setSuccess(true)
      setTimeout(() => navigate('/patients'), 1200)
    } catch (err) {
      console.error(err)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 card text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Patient Enrolled!</h2>
        <p className="text-gray-500 mt-2">14 check-ins have been scheduled. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Enroll New Patient</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {createMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {createMutation.error?.response?.data?.detail || 'Failed to enroll patient. Please check all fields.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="full_name" required minLength={2} value={form.full_name} onChange={handleChange} className="input" placeholder="Patient full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input name="age" type="number" required min={0} max={150} value={form.age} onChange={handleChange} className="input" placeholder="Years" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
            <input name="mobile" required minLength={10} value={form.mobile} onChange={handleChange} className="input" placeholder="+91..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Mobile *</label>
            <input name="family_mobile" required minLength={10} value={form.family_mobile} onChange={handleChange} className="input" placeholder="+91..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surgery Type *</label>
            <input name="surgery_type" required value={form.surgery_type} onChange={handleChange} className="input" placeholder="e.g. Knee Replacement" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date *</label>
            <input name="discharge_date" type="date" required value={form.discharge_date} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
            <input name="doctor_name" required value={form.doctor_name} onChange={handleChange} className="input" placeholder="Attending doctor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
            <input name="doctor_specialty" required value={form.doctor_specialty} onChange={handleChange} className="input" placeholder="e.g. Orthopedics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number *</label>
            <input name="bed_number" required value={form.bed_number} onChange={handleChange} className="input" placeholder="e.g. ICU-12" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UHID *</label>
            <input name="uhid" required value={form.uhid} onChange={handleChange} className="input" placeholder="Hospital UHID" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post-Discharge Instructions</label>
          <textarea
            name="instructions"
            rows={3}
            value={form.instructions}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <UserPlus size={18} />
            {createMutation.isPending ? 'Enrolling...' : 'Enroll Patient'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default Enrollment
