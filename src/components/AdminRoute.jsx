import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function AdminRoute() {
  const { user } = useSelector((state) => state.auth)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}
