import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function ZonesList() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', region: '', description: '' })
  const [error, setError] = useState('')
  const [editingZone, setEditingZone] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', region: '', description: '' })

  useEffect(() => {
    api.get('/api/v1/zones/')
      .then((res) => setZones(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/v1/zones/', form)
      setZones((prev) => [...prev, res.data])
      setForm({ name: '', region: '', description: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create zone')
    }
  }

  const handleEdit = (zone) => {
    setEditingZone(zone.id)
    setEditForm({ name: zone.name, region: zone.region, description: zone.description || '' })
  }

  const handleEditSave = async (zoneId) => {
    try {
      const res = await api.patch(`/api/v1/zones/${zoneId}`, editForm)
      setZones((prev) => prev.map((z) => z.id === zoneId ? res.data : z))
      setEditingZone(null)
    } catch (err) {
      setError('Failed to update zone')
    }
  }

  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Delete this zone?')) return
    try {
      await api.delete(`/api/v1/zones/${zoneId}`)
      setZones((prev) => prev.filter((z) => z.id !== zoneId))
    } catch (err) {
      setError('Failed to delete zone')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Zones</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Zone
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Spintex"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select region</option>
                <option>Greater Accra</option>
                <option>Ashanti</option>
                <option>Central</option>
                <option>Eastern</option>
                <option>Western</option>
                <option>Northern</option>
                <option>Upper East</option>
                <option>Upper West</option>
                <option>Volta</option>
                <option>Brong-Ahafo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes about this zone"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition"
            >
              Create Zone
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-800 font-medium px-6 py-2 rounded-lg text-sm border border-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        loading ? (
          <div className="text-gray-500">Loading zones...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.length === 0 && (
              <div className="text-gray-400 col-span-3">No zones yet</div>
            )}
            {zones.map((zone) => (
              <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                {editingZone === zone.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <select
                      value={editForm.region}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option>Greater Accra</option>
                      <option>Ashanti</option>
                      <option>Central</option>
                      <option>Eastern</option>
                      <option>Western</option>
                      <option>Northern</option>
                      <option>Upper East</option>
                      <option>Upper West</option>
                      <option>Volta</option>
                      <option>Brong-Ahafo</option>
                    </select>
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleEditSave(zone.id)}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingZone(null)}
                        className="border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-gray-800 mb-1">{zone.name}</div>
                    <div className="text-xs text-blue-600 mb-2">{zone.region}</div>
                    <div className="text-sm text-gray-500 mb-3">{zone.description || '—'}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}