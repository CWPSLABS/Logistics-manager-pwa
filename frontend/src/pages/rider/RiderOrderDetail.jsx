import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const statusFlow = ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed']

export default function RiderOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [podPhoto, setPodPhoto] = useState(null)
  const [podPhotoPreview, setPodPhotoPreview] = useState(null)
  const fileRef = useRef()
  const signatureRef = useRef()
  const isDrawing = useRef(false)

  const riderUser = JSON.parse(localStorage.getItem('rider_user') || 'null')

  useEffect(() => {
    if (!riderUser) {
      navigate('/rider/login')
      return
    }
    const token = localStorage.getItem('rider_token')
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    api.get(`/api/v1/orders/${id}`)
      .then((res) => {
        setOrder(res.data)
        setNewStatus(res.data.status)
      })
      .finally(() => setLoading(false))
  }, [id])

  // Signature drawing logic
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = signatureRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    isDrawing.current = true
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const canvas = signatureRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDrawing = (e) => {
    e.preventDefault()
    isDrawing.current = false
  }

  const clearSignature = () => {
    const canvas = signatureRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const getSignatureDataUrl = () => {
    if (!signatureRef.current) return null
    return signatureRef.current.toDataURL('image/png')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPodPhoto(file)
      setPodPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        status: newStatus,
        failure_reason: newStatus === 'failed' ? failureReason : null,
      }

      if (podPhoto) {
        payload.pod_photo_url = `uploaded:${podPhoto.name}`
      }

      const signatureData = getSignatureDataUrl()
      if (signatureData && newStatus === 'delivered') {
        payload.pod_signature_url = signatureData
      }

      const res = await api.patch(`/api/v1/orders/${id}`, payload)
      setOrder(res.data)
      setSuccess('Order updated successfully')

      if (newStatus === 'delivered' || newStatus === 'failed') {
        setTimeout(() => navigate('/rider/orders'), 1500)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

 
 const markPaid = async () => {
  try {
    await api.patch(`/api/v1/orders/${id}`, { is_paid: true })
    setOrder((prev) => ({ ...prev, is_paid: true }))
    setSuccess('Order marked as paid')
  } catch (err) {
    setError('Failed to mark as paid')
  }
}
 
 const openWhatsApp = () => {
  const phone = order.customer_phone.replace(/^0/, '233')
  const message = `Hello ${order.customer_name}, your order ${order.tracking_code} is on its way!\n\nTrack your delivery here: ${window.location.origin}/track/${order.tracking_code}`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}

  const callCustomer = () => {
    window.open(`tel:${order.customer_phone}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
      Loading order...
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
      Order not found
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/rider/orders')} className="text-white text-lg">
          ←
        </button>
        <div>
          <h1 className="font-bold">Order Detail</h1>
          <p className="text-blue-100 text-xs font-mono">{order.tracking_code}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Customer</p>
          <p className="font-semibold text-gray-800 text-lg">{order.customer_name}</p>
          <p className="text-gray-500 text-sm mb-3">{order.customer_phone}</p>
          <div className="flex gap-2">
            <button
              onClick={callCustomer}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              📞 Call
            </button>
            <button
              onClick={openWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              💬 WhatsApp
            </button>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Delivery</p>
          <p className="text-sm text-gray-700 mb-1">📍 {order.delivery_address}</p>
          {order.landmark && (
            <p className="text-sm text-gray-500 mb-1">🏢 {order.landmark}</p>
          )}
          {order.ghana_post_code && (
            <p className="text-sm text-gray-500 mb-1">📮 {order.ghana_post_code}</p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Amount</p>
              <p className="font-bold text-gray-800">GHS {order.amount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="font-medium text-gray-700 uppercase text-sm">{order.payment_method}</p>
            </div>
           
            <div>
  <p className="text-xs text-gray-400">Paid</p>
  {order.is_paid ? (
    <p className="font-medium text-sm text-green-600">Yes</p>
  ) : order.payment_method === 'momo' ? (
    <button
      onClick={markPaid}
      className="mt-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
    >
      Confirm MoMo
    </button>
  ) : (
    <p className="font-medium text-sm text-red-500">No</p>
  )}
</div> 
          </div>
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Notes</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Update Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase">Update Status</p>

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusFlow.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>

          {newStatus === 'failed' && (
            <input
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Reason e.g. Customer not available"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {newStatus === 'delivered' && (
            <>
              {/* POD Photo */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Proof of Delivery Photo</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  {podPhotoPreview ? '📷 Photo selected — tap to change' : '📷 Take or upload photo'}
                </button>
                {podPhotoPreview && (
                  <img
                    src={podPhotoPreview}
                    alt="POD Preview"
                    className="mt-2 w-full rounded-lg object-cover max-h-48"
                  />
                )}
              </div>

              {/* Signature Pad */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recipient Signature</p>
                <canvas
                  ref={signatureRef}
                  width={600}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 border-2 border-gray-300 rounded-lg bg-white touch-none"
                />
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Clear signature
                </button>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  )
}