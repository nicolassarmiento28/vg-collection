import { Navigate, Outlet } from 'react-router-dom'

import { useAuthContext } from './features/auth/state/useAuthContext'

export function PrivateRoute() {
  const { state } = useAuthContext()

  if (!state.session.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
