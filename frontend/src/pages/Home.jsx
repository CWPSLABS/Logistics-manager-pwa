import { useNavigate, Navigate } from 'react-router-dom'
import useAuthStore from '../store/auth'

export default function Home() {
  const navigate = useNavigate()
  const { token } = useAuthStore()

  if (token) return <Navigate to="/dashboard" replace />
   return <Navigate to="/landing" replace />

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🚚</div>
        <h1 className="text-4xl font-bold text-white">SmartMobility</h1>
        <p className="text-gray-400 mt-2">Logistics Manager</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          🚀 Get Started Free
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 rounded-xl text-lg transition"
        >
          🏢 Admin / Dispatcher
        </button>
        <button
          onClick={() => navigate('/rider/login')}
          className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          🏍️ Rider Portal
        </button>
        <button
          onClick={() => navigate('/track')}
          className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          📦 Track My Order
        </button>
      </div>
    </div>
  )
}
