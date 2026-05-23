import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RiderRoute from './components/RiderRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import OrdersList from './pages/orders/OrdersList'
import OrderForm from './pages/orders/OrderForm'
import OrderDetail from './pages/orders/OrderDetail'
import RidersList from './pages/riders/RidersList'
import RiderForm from './pages/riders/RiderForm'
import RiderDetail from './pages/riders/RiderDetail'
import ZonesList from './pages/zones/ZonesList'
import PaymentsList from './pages/payments/PaymentsList'
import RiderLogin from './pages/rider/RiderLogin'
import RiderOrders from './pages/rider/RiderOrders'
import RiderOrderDetail from './pages/rider/RiderOrderDetail'
import Track from './pages/Track'
import Profile from './pages/Profile'
import Home from './pages/Home'
import RiderProfile from './pages/rider/RiderProfile'
import Register from './pages/Register'
import Billing from './pages/Billing'
import Landing from './pages/Landing'
import Contact from './pages/Contact'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:code" element={<Track />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />

        {/* Rider Portal */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/orders" element={<RiderRoute><RiderOrders /></RiderRoute>} />
        <Route path="/rider/orders/:id" element={<RiderRoute><RiderOrderDetail /></RiderRoute>} />
        <Route path="/rider/profile" element={<RiderRoute><RiderProfile /></RiderRoute>} />

        {/* Admin/Dispatcher Dashboard */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<OrdersList />} />
                  <Route path="/orders/new" element={<OrderForm />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/riders" element={<RidersList />} />
                  <Route path="/riders/new" element={<RiderForm />} />
                  <Route path="/riders/:id" element={<RiderDetail />} />
                  <Route path="/zones" element={<ZonesList />} />
                  <Route path="/payments" element={<PaymentsList />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* Fallback for authenticated users */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/billing" element={<Billing />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App