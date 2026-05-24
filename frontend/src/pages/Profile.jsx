import { useState } from 'react'
import api from '../services/api'
import useAuthStore from '../store/auth'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match')
      return
    }

    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/v1/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess('Password changed successfully. Please log in again.')
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account Info</p>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Full Name</p>
            <p className="font-medium text-gray-800">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium text-gray-800">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Role</p>
            <p className="font-medium text-gray-800 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Change Password</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        After changing your password you will be logged out automatically.
      </p>
    </div>
  )
}