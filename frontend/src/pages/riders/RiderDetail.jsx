import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function RiderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rider, setRider] = useState(null)
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    vehicle_type: '',
    license_number: '',
    zone_id: '',
  })

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/riders/${id}`),
      api.get('/api/v1/zones/'),
    ]).then(([riderRes, zonesRes]) => {
      setRider(riderRes.data)
      setZones(zonesRes.data)
      setForm({
        vehicle_type: riderRes.data.vehicle_type || 'bike',
        license_number: riderRes.data.license_number || '',
        zone_id: riderRes.data.zone_id || '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.patch(`/api/v1/riders/${id}`, {
        vehicle_type: form.vehicle_type,
        license_number: form.license_number,
        zone_id: form.zone_id ? parseInt(form.zone_id) : null,
      })
      setRider(res.data)
      setSuccess('Rider updated successfully')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update rider')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this rider?')) return
    try {
      await api.delete(`/api/v1/riders/${id}`)
      navigate('/riders')
    } catch (err) {
      setError('Failed to delete rider')
    }
  }

  if (loading) return <div className="text-gray-500">Loading rider...</div>
  if (!rider) return <div className="text-red-500">Rider not found</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rider Detail</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/riders')}
            className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Rider Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-800">{rider.user?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-800">{rider.user?.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-800">{rider.user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Availability</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              rider.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {rider.is_available ? 'Available' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Edit Rider</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={form.vehicle_type}
              onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="bicycle">Bicycle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
          <select
            value={form.zone_id}
            onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No zone</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} — {z.region}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}