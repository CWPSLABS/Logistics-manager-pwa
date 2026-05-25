import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function PaymentsList() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const endpoint = tab === 'unreconciled'
      ? '/api/v1/payments/cod/unreconciled'
      : '/api/v1/payments/'
    api.get(endpoint)
      .then((res) => setPayments(res.data))
      .finally(() => setLoading(false))
  }, [tab])

  const markSettled = async (paymentId) => {
    await api.patch(`/api/v1/payments/${paymentId}`, { is_settled: true })
    setPayments((prev) =>
      prev.map((p) => p.id === paymentId ? { ...p, is_settled: true } : p)
    )
  }

  const exportCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/export/cod`, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Payments</h2>
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'unreconciled'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
              tab === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? 'All Payments' : 'COD Unreconciled'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          No payments found
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{payment.order_id}</p>
                    <p className="text-xs uppercase text-gray-400">{payment.method}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-bold text-gray-800">GHS {payment.amount}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.is_settled ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {payment.is_settled ? 'Settled' : 'Pending'}
                  </span>
                </div>
                {!payment.is_settled && (
                  <button
                    onClick={() => markSettled(payment.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark Settled
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Settled</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">#{payment.order_id}</td>
                    <td className="px-4 py-3 font-medium">GHS {payment.amount}</td>
                    <td className="px-4 py-3 uppercase text-xs text-gray-600">{payment.method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.is_settled ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {payment.is_settled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!payment.is_settled && (
                        <button
                          onClick={() => markSettled(payment.id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Mark Settled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
