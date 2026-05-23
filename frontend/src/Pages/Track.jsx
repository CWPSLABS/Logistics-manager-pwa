import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const statusSteps = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

const statusInfo = {
  pending: { label: 'Order Placed', icon: '📋', color: 'text-yellow-500' },
  assigned: { label: 'Rider Assigned', icon: '🏍️', color: 'text-blue-500' },
  picked_up: { label: 'Picked Up', icon: '📦', color: 'text-indigo-500' },
  in_transit: { label: 'On The Way', icon: '🚀', color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: '✅', color: 'text-green-500' },
  failed: { label: 'Delivery Failed', icon: '❌', color: 'text-red-500' },
  rescheduled: { label: 'Rescheduled', icon: '🔄', color: 'text-orange-500' },
}

export default function Track() {
  const [trackingCode, setTrackingCode] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!trackingCode.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await api.get(`/api/v1/orders/track/${trackingCode.trim().toUpperCase()}`)
      setOrder(res.data)
    } catch (err) {
      setError('Order not found. Please check your tracking code.')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order
    ? statusSteps.indexOf(order.status)
    : -1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-6 text-center">
        <h1 className="text-2xl font-bold">SmartMobility</h1>
        <p className="text-blue-100 text-sm mt-1">Track your delivery</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Enter tracking code e.g. LGS-A1B2C3D4"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{order.customer_name}</p>
                  <p className="text-xs font-mono text-gray-400">{order.tracking_code}</p>
                </div>
                <div className={`text-3xl`}>
                  {statusInfo[order.status]?.icon}
                </div>
              </div>

              <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 ${statusInfo[order.status]?.color}`}>
                {statusInfo[order.status]?.label}
              </div>

              {order.failure_reason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  Reason: {order.failure_reason}
                </div>
              )}
            </div>

            {/* Status Timeline */}
            {order.status !== 'failed' && order.status !== 'rescheduled' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-4">Delivery Progress</p>
                <div className="space-y-3">
                  {statusSteps.map((step, index) => {
                    const isDone = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isDone
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isDone ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-blue-600' : isDone ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {statusInfo[step]?.label}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-xs text-blue-500 font-medium">Current</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Delivery Details</p>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Address</p>
                  <p className="text-gray-800">{order.delivery_address}</p>
                </div>
                {order.landmark && (
                  <div>
                    <p className="text-gray-400 text-xs">Landmark</p>
                    <p className="text-gray-800">{order.landmark}</p>
                  </div>
                )}
                {order.ghana_post_code && (
                  <div>
                    <p className="text-gray-400 text-xs">Ghana Post GPS</p>
                    <p className="text-gray-800 font-mono">{order.ghana_post_code}</p>
                  </div>
                )}
                <div className="flex gap-6 pt-2">
                  <div>
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className="text-gray-800 font-medium">GHS {order.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Payment</p>
                    <p className="text-gray-800 uppercase font-medium">{order.payment_method}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivered confirmation */}
            {order.status === 'delivered' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-green-700">Your order has been delivered!</p>
                <p className="text-green-600 text-sm mt-1">Thank you for using SmartMobility!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          Powered by SmartMobility · Smart service, Happy Customer.
        </div>
      </div>
    </div>
  )
}