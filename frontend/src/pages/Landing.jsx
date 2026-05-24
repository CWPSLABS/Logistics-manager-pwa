import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '📦',
    title: 'Order Management',
    description: 'Create, assign and track deliveries in real time. Full status history from pickup to delivery.',
  },
  {
    icon: '🏍️',
    title: 'Rider Portal',
    description: 'Mobile-first rider app with proof of delivery, photo capture, signature pad and WhatsApp integration.',
  },
  {
    icon: '📍',
    title: 'Ghana-First Addressing',
    description: 'Built for Ghana — supports Ghana Post GPS codes, landmark-based directions and Mobile Money payments.',
  },
  {
    icon: '📊',
    title: 'Live Dashboard',
    description: 'Real-time delivery stats, revenue tracking, COD reconciliation and zone performance.',
  },
  {
    icon: '💬',
    title: 'Customer Tracking',
    description: 'Shareable tracking link sent via WhatsApp. Customers track their order live — no app needed.',
  },
  {
    icon: '💰',
    title: 'Payment Reconciliation',
    description: 'Track COD collections, Mobile Money confirmations and Paystack payments in one place.',
  },
]

const plans = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    color: 'border-gray-200',
    button: 'bg-gray-800 hover:bg-gray-900',
    features: [
      '1 dispatcher account',
      'Up to 3 riders',
      'Up to 50 orders/month',
      'Basic dashboard',
      'Customer tracking page',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 199,
    popular: true,
    color: 'border-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700',
    features: [
      'Up to 5 dispatchers',
      'Up to 20 riders',
      'Unlimited orders',
      'SMS notifications',
      'CSV exports',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    color: 'border-purple-500',
    button: 'bg-purple-600 hover:bg-purple-700',
    features: [
      'Unlimited dispatchers',
      'Unlimited riders',
      'Unlimited orders',
      'SMS notifications',
      'CSV exports',
      'API access',
      'Dedicated support',
    ],
  },
]

const faqs = [
  {
    q: 'Do I need a credit card to get started?',
    a: 'No. The Starter plan is completely free with no card required. Upgrade anytime when your business grows.',
  },
  {
    q: 'How do riders access the app?',
    a: 'Riders get a dedicated mobile portal at /rider/login. You create their account from the admin dashboard and share the link via WhatsApp.',
  },
  {
    q: 'Does it work for e-commerce businesses?',
    a: 'Yes. SmartMobility is built for both logistics companies and e-commerce platforms that manage their own deliveries.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'Cash on Delivery (COD), Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo) and card payments via Paystack.',
  },
  {
    q: 'Can customers track their orders?',
    a: 'Yes. Every order gets a unique tracking link the rider shares via WhatsApp. Customers open it in any browser — no app install needed.',
  },
  {
    q: 'Is my data safe?',
    a: "Yes. Each company's data is completely isolated. We use industry-standard encryption and secure authentication.",
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div id="top" className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/landing')}
          >
            <span className="text-xl">🚚</span>
            <span className="text-base font-bold text-gray-900">SmartMobility</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a onClick={() => navigate('/home')} className="hover:text-blue-600 transition cursor-pointer">Home</a>
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
            <a onClick={() => navigate('/contact')} className="hover:text-blue-600 transition cursor-pointer">Contact</a>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-xs text-gray-600 font-medium px-3 py-1.5 border border-gray-300 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile nav links row */}
        <div className="flex md:hidden items-center justify-center gap-5 text-xs text-gray-500 pt-2 border-t border-gray-100 mt-2">
          <a onClick={() => navigate('/home')} className="hover:text-blue-600 cursor-pointer">Home</a>
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#pricing" className="hover:text-blue-600">Pricing</a>
          <a href="#faq" className="hover:text-blue-600">FAQ</a>
          <a onClick={() => navigate('/contact')} className="hover:text-blue-600 cursor-pointer">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            🇬🇭 Built for Ghana's Delivery Industry
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Manage Every Delivery.<br />
            <span className="text-blue-600">From Order to Doorstep.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            SmartMobility is a logistics management PWA built for Ghanaian delivery companies and e-commerce platforms. Track orders, manage riders, accept Mobile Money — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-blue-200"
            >
              Start Free — No Card Needed
            </button>
            <button
              onClick={() => navigate('/track')}
              className="w-full sm:w-auto border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              📦 Track an Order
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Free forever on Starter · No setup fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '3', label: 'User Roles' },
            { value: 'MoMo', label: 'Payment Support' },
            { value: 'GPS', label: 'Ghana Post Ready' },
            { value: 'PWA', label: 'Works Offline' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-blue-100 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Everything your delivery business needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Purpose-built for Ghana's unique delivery challenges — from addressing to payments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Get your delivery operations running in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create your account',
                description: 'Register your company, set up zones and add your riders — takes less than 5 minutes.',
              },
              {
                step: '02',
                title: 'Assign deliveries',
                description: 'Create orders, assign riders by zone, and send tracking links to customers via WhatsApp.',
              },
              {
                step: '03',
                title: 'Track everything',
                description: 'Monitor deliveries in real time, reconcile payments and export reports — all from your dashboard.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-extrabold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500">Priced for Ghana. No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-6 relative flex flex-col justify-between shadow-sm ${plan.color}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-extrabold text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-gray-900">GHS {plan.price}</span>
                        <span className="text-gray-400 text-sm">/month</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition ${plan.button}`}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Start with ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 p-5 group">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to modernize your delivery operations?
          </h2>
          <p className="text-blue-100 mb-8">
            Join delivery companies across Ghana using SmartMobility to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-blue-400 hover:border-white text-white font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">🚚</span>
          <span className="font-bold text-white">SmartMobility</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-xs">
          <button onClick={() => navigate('/')} className="hover:text-white transition">Home</button>
          <button onClick={() => navigate('/login')} className="hover:text-white transition">Admin Login</button>
          <button onClick={() => navigate('/rider/login')} className="hover:text-white transition">Rider Portal</button>
          <button onClick={() => navigate('/track')} className="hover:text-white transition">Track Order</button>
          <button onClick={() => navigate('/register')} className="hover:text-white transition">Get Started</button>
          <button onClick={() => navigate('/contact')} className="hover:text-white transition">Contact Us</button>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} SmartMobility. Built for Ghana's delivery industry.</p>
      </footer>

    </div>
  )
}
