import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Contact() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subject: 'general',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    const res = await fetch('https://formspree.io/f/mbdbdebg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setSubmitted(true)
    } else {
      alert('Failed to send. Please try again.')
    }
  } catch (err) {
    alert('Failed to send. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/landing')}
          >
            <span className="text-2xl">🚚</span>
            <span className="text-xl font-bold text-gray-900">SmartMobility</span>
          </div>
          <div className="flex items-center gap-3">
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
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Have questions about SmartMobility? Want a demo for your delivery company?
              We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Contact Details
                </p>
                <div className="space-y-4">
                  {[
                    { icon: '📧', label: 'Email', value: 'cwplabs@gmail.com' },
                    { icon: '📞', label: 'Phone', value: '+233 54 059 9057' },
                    { icon: '💬', label: 'WhatsApp', value: '+233 54 024 7795' },
                    { icon: '📍', label: 'Location', value: 'Accra, Ghana' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                  Business Hours
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday — Friday</span>
                    <span className="font-medium">8am — 6pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">9am — 2pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-red-400">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">
                  Quick Start
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Want to try SmartMobility right away? Create your free account in under 2 minutes.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  Start for Free
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center bg-green-50 rounded-2xl p-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', message: '', subject: 'general' }) }}
                      className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Send Another
                    </button>
                    <button
                      onClick={() => navigate('/landing')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5"
                >
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Send us a message
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Kwame Mensah"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="kwame@company.com"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="024XXXXXXX"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Accra Express Delivery"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="demo">Request a Demo</option>
                      <option value="pricing">Pricing Question</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us about your delivery operations and how we can help..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    We typically respond within 24 hours on business days.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🚚</span>
          <span className="font-bold text-white">SmartMobility</span>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4 text-xs">
          <button onClick={() => navigate('/landing')} className="hover:text-white transition">Home</button>
          <button onClick={() => navigate('/login')} className="hover:text-white transition">Admin Login</button>
          <button onClick={() => navigate('/rider/login')} className="hover:text-white transition">Rider Portal</button>
          <button onClick={() => navigate('/track')} className="hover:text-white transition">Track Order</button>
        </div>
        <p>© {new Date().getFullYear()} SmartMobility. Built for Ghana's delivery industry.</p>
      </footer>
    </div>
  )
}