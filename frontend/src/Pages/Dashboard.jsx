import { useEffect, useState } from 'react'
import api from '../services/api'

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
  </div>
)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/v1/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={summary.orders.total} color="text-gray-800" />
        <StatCard label="Today's Orders" value={summary.orders.today} color="text-blue-600" />
        <StatCard label="Delivered" value={summary.orders.delivered} color="text-green-600" />
        <StatCard label="Failed" value={summary.orders.failed} color="text-red-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending" value={summary.orders.pending} color="text-yellow-500" />
        <StatCard label="In Transit" value={summary.orders.in_transit} color="text-blue-400" />
        <StatCard label="Available Riders" value={summary.available_riders} color="text-purple-600" />
        <StatCard label="COD Unreconciled (GHS)" value={summary.cod_unreconciled?.toFixed(2)} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Revenue (GHS)</p>
          <p className="text-3xl font-bold text-green-600">
            {summary.revenue.total?.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Today's Revenue (GHS)</p>
          <p className="text-3xl font-bold text-green-400">
            {summary.revenue.today?.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}