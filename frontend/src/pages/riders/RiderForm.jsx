import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function RiderForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [zones, setZones] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    vehicle_type: 'bike',
    license_number: '',
    zone_id: '',
  })

  useEffect(() => {
    api.get('/api/v1/zones/').then((res) => setZones(res.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Step 1: Create user with rider role
      const userRes = await api.post('/api/v1/auth/register', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'rider',
      })

      // Step 2: Create rider profile linked to user
      await api.post('/api/v1/riders/', {
        user_id: userRes.data.id,
        vehicle_type: form.vehicle_type,
        license_number: form.license_number,
        zone_id: form.zone_id ? parseInt(form.zone_id) : null,
      })

      navigate('/riders')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create rider')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Rider</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account Details</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="024XXXXXXX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Rider Details</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
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
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              placeholder="GR-1234-22"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Zone</label>
          <select
            name="zone_id"
            value={form.zone_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No zone yet</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} — {z.region}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Rider'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/riders')}
            className="text-gray-600 hover:text-gray-800 font-medium px-6 py-2 rounded-lg text-sm border border-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}