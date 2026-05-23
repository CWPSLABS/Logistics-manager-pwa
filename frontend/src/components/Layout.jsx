import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/auth'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/riders', label: 'Riders', icon: '🏍️' },
  { path: '/zones', label: 'Zones', icon: '🗺️' },
  { path: '/payments', label: 'Payments', icon: '💰' },
  { path: '/billing', label: 'Billing', icon: '💳' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">SmartMobility</h1>
          <p className="text-xs text-gray-500 mt-1">Logistics Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname.startsWith(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

 <div className="p-4 border-t border-gray-200">
  <div className="text-sm text-gray-700 font-medium mb-1">{user?.full_name}</div>
  <div className="text-xs text-gray-400 mb-3 capitalize">{user?.role}</div>
  <div className="flex flex-col gap-1">
    <Link
      to="/profile"
      className="text-xs text-blue-500 hover:text-blue-700"
    >
      Change Password
    </Link>
    <button
      onClick={handleLogout}
      className="text-sm text-red-500 hover:text-red-700 text-left"
    >
      Sign out
    </button>
  </div>
</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}