import { Navigate } from 'react-router-dom'

export default function RiderRoute({ children }) {
  const token = localStorage.getItem('rider_token')
  if (!token) return <Navigate to="/rider/login" replace />
  return children
}