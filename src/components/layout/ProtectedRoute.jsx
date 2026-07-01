import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingScreen from '../ui/LoadingScreen.jsx'

export default function ProtectedRoute({ children, requirePermission }) {
  const { loading, isAuthenticated, profileError, can, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Checking access..." />

  if (!isAuthenticated) {
    // Either no firebase user, or user exists but no adminUsers profile
    if (profileError) {
      return (
        <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
          <div className="max-w-md">
            <h1 className="font-display text-2xl text-ink-900">Access not configured</h1>
            <p className="mt-3 text-ink-600">{profileError}</p>
            <button onClick={signOut} className="btn-secondary mt-6">
              Sign out
            </button>
          </div>
        </div>
      )
    }
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requirePermission && !can(requirePermission)) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl text-ink-900">Not authorised</h1>
          <p className="mt-3 text-ink-600">
            You don't have permission to access this area. Speak to a super-admin if you think
            this is a mistake.
          </p>
        </div>
      </div>
    )
  }

  return children
}
