import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const statusOptions = [
  'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'rescheduled'
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rescheduled: 'bg-orange-100 text-orange-700',
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    status: '',
    rider_id: '',
    notes: '',
    failure_reason: '',
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    ghana_post_code: '',
    landmark: '',
    amount: '',
  
  })

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/orders/${id}`),
      api.get('/api/v1/riders/?available_only=false'),
    ]).then(([orderRes, ridersRes]) => {
      setOrder(orderRes.data)
      setRiders(ridersRes.data)
setForm({
  status: orderRes.data.status,
  rider_id: orderRes.data.rider_id || '',
  notes: orderRes.data.notes || '',
  failure_reason: orderRes.data.failure_reason || '',
  customer_name: orderRes.data.customer_name || '',
  customer_phone: orderRes.data.customer_phone || '',
  delivery_address: orderRes.data.delivery_address || '',
  ghana_post_code: orderRes.data.ghana_post_code || '',
  landmark: orderRes.data.landmark || '',
  amount: orderRes.data.amount || '',
})
    }).finally(() => setLoading(false))
  }, [id])

const handleSave = async () => {
  setSaving(true)
  setError('')
  setSuccess('')
  try {
    const payload = {
      status: form.status,
      notes: form.notes,
      failure_reason: form.failure_reason || null,
      rider_id: form.rider_id ? parseInt(form.rider_id) : null,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      delivery_address: form.delivery_address,
      ghana_post_code: form.ghana_post_code || null,
      landmark: form.landmark || null,
      amount: parseFloat(form.amount),
    }
    const res = await api.patch(`/api/v1/orders/${id}`, payload)
    setOrder(res.data)
    setSuccess('Order updated successfully')
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to update order')
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await api.delete(`/api/v1/orders/${id}`)
      navigate('/orders')
    } catch (err) {
      setError('Failed to delete order')
    }
  }

  if (loading) return <div className="text-gray-500">Loading order...</div>
  if (!order) return <div className="text-red-500">Order not found</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Detail</h2>
          <p className="text-xs font-mono text-gray-400 mt-1">{order.tracking_code}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/orders')}
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

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-800">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-800">{order.customer_phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-800">{order.delivery_address}</p>
          </div>
          {order.landmark && (
            <div className="col-span-2">
              <p className="text-gray-500">Landmark</p>
              <p className="font-medium text-gray-800">{order.landmark}</p>
            </div>
          )}
          {order.ghana_post_code && (
            <div>
              <p className="text-gray-500">Ghana Post Code</p>
              <p className="font-medium text-gray-800">{order.ghana_post_code}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-medium text-gray-800">GHS {order.amount}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium text-gray-800 uppercase">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-gray-500">Paid</p>
            <p className={`font-medium ${order.is_paid ? 'text-green-600' : 'text-red-500'}`}>
              {order.is_paid ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Update Order</p>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Customer Details</p>
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
    <input
      value={form.customer_name}
      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
    <input
      value={form.customer_phone}
      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
      placeholder="024XXXXXXX"
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
  <input
    value={form.delivery_address}
    onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Ghana Post Code</label>
    <input
      value={form.ghana_post_code}
      onChange={(e) => setForm({ ...form, ghana_post_code: e.target.value })}
      placeholder="GA-123-4567"
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
    <input
      value={form.landmark}
      onChange={(e) => setForm({ ...form, landmark: e.target.value })}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
  <input
    type="number"
    value={form.amount}
    onChange={(e) => setForm({ ...form, amount: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Status & Assignment</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Rider</label>
            <select
              value={form.rider_id}
              onChange={(e) => setForm({ ...form, rider_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.user?.full_name} — {r.vehicle_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.status === 'failed' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Failure Reason</label>
            <input
              value={form.failure_reason}
              onChange={(e) => setForm({ ...form, failure_reason: e.target.value })}
              placeholder="e.g. Customer not available"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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