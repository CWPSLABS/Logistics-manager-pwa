import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rescheduled: 'bg-orange-100 text-orange-700',
}

export default function RiderOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [rider, setRider] = useState(null)
  const navigate = useNavigate()

  const riderUser = JSON.parse(localStorage.getItem('rider_user') || 'null')

  useEffect(() => {
    if (!riderUser) {
      navigate('/rider/login')
      return
    }

    // Get rider profile then fetch their orders
    const token = localStorage.getItem('rider_token')
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    api.get('/api/v1/riders/')
      .then((res) => {
        const myRider = res.data.find((r) => r.user_id === riderUser.id)
        if (myRider) {
          setRider(myRider)
          return api.get(`/api/v1/riders/${myRider.id}/orders`)
        }
      })
      .then((res) => {
        if (res) setOrders(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('rider_token')
    localStorage.removeItem('rider_user')
    navigate('/rider/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">My Deliveries</h1>
          <p className="text-blue-100 text-xs">{riderUser?.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {rider && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              rider.is_available ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {rider.is_available ? 'Online' : 'Offline'}
            </span>
          )}
          <button
    onClick={() => navigate('/rider/profile')}
    className="text-blue-100 text-xs hover:text-white"
  >
    Profile
  </button>   
          
          <button
            onClick={handleLogout}
            className="text-blue-100 text-xs hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading orders...</div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">📦</div>
            <p>No orders assigned yet</p>
          </div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/rider/orders/${order.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_phone}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              📍 {order.landmark || order.delivery_address}
            </p>
            {order.ghana_post_code && (
              <p className="text-xs text-gray-400">GPS: {order.ghana_post_code}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium text-gray-800">GHS {order.amount}</p>
              <p className="text-xs uppercase text-gray-400">{order.payment_method}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}