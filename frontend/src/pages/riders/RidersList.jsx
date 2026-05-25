import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function RidersList() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/riders/')
      .then((res) => setRiders(res.data))
      .finally(() => setLoading(false))
  }, [])

  const toggleAvailability = async (riderId) => {
    await api.patch(`/api/v1/riders/${riderId}/toggle-availability`)
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId ? { ...r, is_available: !r.is_available } : r
      )
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Riders</h2>
        <Link
          to="/riders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Rider
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading riders...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm min-w-[550px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No riders found
                  </td>
                </tr>
              )}
              {riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {rider.user?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rider.user?.phone || '—'}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">
                    {rider.vehicle_type || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rider.zone?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rider.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {rider.is_available ? 'Available' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <button
                      onClick={() => toggleAvailability(rider.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Toggle
                    </button>
                    <Link
                      to={`/riders/${rider.id}`}
                      className="text-gray-600 hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
