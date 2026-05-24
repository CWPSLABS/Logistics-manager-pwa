import { useEffect, useState } from 'react'
import api from '../services/api'

const planColors = {
  free: 'border-gray-200 hover:border-gray-300',
  growth: 'border-blue-200 hover:border-blue-400',
  pro: 'border-purple-200 hover:border-purple-500',
}

const planBadgeColors = {
  free: 'bg-gray-100 text-gray-600 border border-gray-200',
  growth: 'bg-blue-50 text-blue-600 border border-blue-200',
  pro: 'bg-purple-50 text-purple-600 border border-purple-200',
}

function UsageBar({ label, used, limit, unlimited }) {
  const pct = unlimited || !limit ? 0 : Math.min((used / limit) * 100, 100)
  const isHigh = pct >= 80

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className={isHigh ? 'text-red-500 font-semibold' : ''}>
          {unlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isHigh ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {unlimited && (
        <div className="w-full bg-green-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-green-400 w-full" />
        </div>
      )}
    </div>
  )
}

export default function Billing() {
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/v1/subscription/'),
      api.get('/api/v1/subscription/plans'),
      api.get('/api/v1/subscription/usage'),
    ])
      .then(([subRes, plansRes, usageRes]) => {
        setSubscription(subRes.data)
        setPlans(plansRes.data.plans || [])
        setUsage(usageRes.data)
      })
      .catch(() => setError('Failed to load billing information.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || upgrading) return
    setUpgrading(planId)
    setError('')
    setSuccess('')

    try {
      const initRes = await api.post(`/api/v1/subscription/initialize-payment?plan=${planId}`)
      const { email, amount, metadata } = initRes.data

      let attempts = 0
      while (!window.PaystackPop && attempts < 10) {
        await new Promise((r) => setTimeout(r, 300))
        attempts++
      }

      if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
        throw new Error('Paystack failed to load. Check your internet connection.')
      }

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
       // key: 'pk_test_ea5d5626984e25d516fbeb4b83924ef233dfa1f7',
        email,
        amount,
        currency: 'GHS',
        metadata,
        callback: function (response) {
          api.post('/api/v1/subscription/upgrade', {
            plan: planId,
            reference: response.reference,
          })
            .then(() => {
              setSuccess(`Successfully upgraded to ${planId} plan!`)
              loadData()
            })
            .catch((err) => {
              setError(err.response?.data?.detail || 'Payment received but upgrade failed.')
            })
            .finally(() => setUpgrading(null))
        },
        onClose: function () {
          setUpgrading(null)
        },
      })

      handler.openIframe()
    } catch (err) {
      setError(err.message || 'Failed to initialize payment.')
      setUpgrading(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    setError('')
    try {
      const res = await api.post('/api/v1/subscription/cancel')
      setSuccess(res.data.message)
      loadData()
      setShowCancelConfirm(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel subscription.')
    } finally {
      setCancelling(false)
    }
  }

  const handleRestore = async () => {
    setRestoring(true)
    setError('')
    try {
      const res = await api.post('/api/v1/subscription/restore')
      setSuccess(res.data.message)
      loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to restore subscription.')
    } finally {
      setRestoring(false)
    }
  }

  const handleDowngrade = async () => {
    if (!confirm('Are you sure you want to downgrade to the free plan? You will lose access to paid features immediately.')) return
    setError('')
    try {
      const res = await api.post('/api/v1/subscription/downgrade')
      setSuccess(res.data.message)
      loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to downgrade.')
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })
  }

  const daysUntilExpiry = () => {
    if (!subscription?.expires_at) return null
    const diff = new Date(subscription.expires_at) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500 font-medium">Loading billing data...</span>
      </div>
    )
  }

  const days = daysUntilExpiry()
  const isExpiringSoon = days !== null && days <= 7
  const isSubExpired = subscription?.is_expired

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Plans</h2>
        <p className="text-sm text-gray-500">Manage your subscription and track usage.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-3">
          <span className="font-bold">✕</span><div>{error}</div>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex gap-3">
          <span className="font-bold">✓</span><div>{success}</div>
        </div>
      )}

      {/* Expiry Warning */}
      {isExpiringSoon && !isSubExpired && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm flex gap-3">
          <span>⚠️</span>
          <div>Your {subscription.plan} plan expires in <strong>{days} day{days !== 1 ? 's' : ''}</strong>. Renew to avoid interruption.</div>
        </div>
      )}

      {isSubExpired && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-3">
          <span>⛔</span>
          <div>Your subscription has expired. Please renew to continue using paid features.</div>
        </div>
      )}

      {/* Current Plan Card */}
      {subscription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Plan</p>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${planBadgeColors[subscription.plan]}`}>
                  {subscription.plan}
                </span>
                {!subscription.is_active && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                    Cancelled
                  </span>
                )}
                {isSubExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200">
                    Expired
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {subscription.started_at && (
                  <div>
                    <p className="text-xs text-gray-400">Started</p>
                    <p className="font-medium text-gray-700">{formatDate(subscription.started_at)}</p>
                  </div>
                )}
                {subscription.expires_at && (
                  <div>
                    <p className="text-xs text-gray-400">
                      {isSubExpired ? 'Expired On' : 'Renews On'}
                    </p>
                    <p className={`font-medium ${isSubExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {formatDate(subscription.expires_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Actions */}
            {subscription.plan !== 'free' && (
              <div className="flex flex-col gap-2 min-w-[160px]">
                {subscription.is_active ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition"
                  >
                    Cancel Plan
                  </button>
                ) : (
                  <button
                    onClick={handleRestore}
                    disabled={restoring}
                    className="text-sm text-green-600 hover:text-green-800 border border-green-200 hover:border-green-400 px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {restoring ? 'Restoring...' : 'Restore Plan'}
                  </button>
                )}
                <button
                  onClick={handleDowngrade}
                  className="text-xs text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg transition"
                >
                  Downgrade to Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="font-semibold text-red-700 mb-1">Cancel your subscription?</p>
          <p className="text-sm text-red-600 mb-4">
            You will retain access until your billing period ends on {formatDate(subscription?.expires_at)}. After that you'll be moved to the free plan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Keep Plan
            </button>
          </div>
        </div>
      )}

      {/* Usage Section */}
      {usage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Usage This Month</p>
          <div className="space-y-4">
            <UsageBar
              label="Riders"
              used={usage.usage.riders.used}
              limit={usage.usage.riders.limit}
              unlimited={usage.usage.riders.unlimited}
            />
            <UsageBar
              label="Dispatchers"
              used={usage.usage.dispatchers.used}
              limit={usage.usage.dispatchers.limit}
              unlimited={usage.usage.dispatchers.unlimited}
            />
            <UsageBar
              label="Orders this month"
              used={usage.usage.orders_this_month.used}
              limit={usage.usage.orders_this_month.limit}
              unlimited={usage.usage.orders_this_month.unlimited}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
            {[
              { label: 'SMS Notifications', enabled: usage.features.sms_notifications },
              { label: 'CSV Export', enabled: usage.features.csv_export },
              { label: 'API Access', enabled: usage.features.api_access },
            ].map((f) => (
              <div key={f.label} className={`text-center p-3 rounded-lg text-xs font-medium ${
                f.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
              }`}>
                <div className="text-lg mb-1">{f.enabled ? '✓' : '✕'}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Available Plans</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = subscription?.plan === plan.id
          const isPopular = plan.id === 'growth'
          
          // Computed expiry status using backend status fallback
          const isExpired = subscription?.expires_at 
            ? new Date(subscription.expires_at) < new Date() 
            : subscription?.is_expired || false

          // Gatekeeper validation variable
          const isCurrentAndValid = isCurrent && subscription?.is_active && !isExpired

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-sm border-2 p-6 relative flex flex-col justify-between transition-all duration-200 ${
                isCurrent ? 'border-blue-500 ring-4 ring-blue-50' : planColors[plan.id]
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                    Recommended
                  </span>
                </div>
              )}

              {/* Conditional Badges based on active/expired logic */}
              {isCurrent && !isExpired && subscription?.is_active && (
                <div className="absolute -top-3.5 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Active
                  </span>
                </div>
              )}

              {isCurrent && isExpired && (
                <div className="absolute -top-3.5 right-4">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Expired
                  </span>
                </div>
              )}

              <div>
                <div className="mb-6 mt-2">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-extrabold text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-gray-900">GHS {plan.price}</span>
                        <span className="text-gray-400 text-sm">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 border-t border-gray-50 pt-4">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Multi-state action button block */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentAndValid || upgrading !== null || plan.id === 'free'}
                className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none ${
                  isCurrentAndValid
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.id === 'free'
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : plan.id === 'pro'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100'
                }`}
              >
                {isCurrentAndValid
                  ? 'Active Plan'
                  : upgrading === plan.id
                  ? 'Connecting to Paystack...'
                  : plan.id === 'free'
                  ? 'Default Base'
                  : isCurrent && isExpired
                  ? `Renew ${plan.name}`
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Payments processed securely via Paystack. Cancel anytime.</span>
      </div>
    </div>
  )
}