// AuthContext — handles Firebase auth state and loads the corresponding
// adminUsers doc so the rest of the app can read role and permissions.

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase/config.js'
import { getAdminUser } from '../firebase/services.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null) // adminUsers doc
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true)
      setProfileError(null)
      if (!fbUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      setUser(fbUser)
      try {
        const adminProfile = await getAdminUser(fbUser.uid)
        if (!adminProfile) {
          setProfileError(
            'This account exists but has no admin profile. Ask a super-admin to grant access.'
          )
          setProfile(null)
        } else {
          setProfile(adminProfile)
        }
      } catch (err) {
        console.error(err)
        setProfileError(err.message || 'Could not load admin profile.')
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signOut = () => fbSignOut(auth)
  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  // Role helpers
  const role = profile?.role
  const isAuthenticated = !!user && !!profile
  const isSuperAdmin = role === 'super_admin'
  const isAdmin = role === 'super_admin' || role === 'admin'
  const isEditor = !!role // any role counts as editor or above

  const can = (perm) => {
    if (!profile) return false
    switch (perm) {
      case 'manage_users':
        return isSuperAdmin
      case 'manage_settings':
        return isAdmin
      case 'manage_content':
        return isEditor
      case 'view_submissions':
        return isEditor
      case 'delete_content':
        return isAdmin
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileError,
        signIn,
        signOut,
        resetPassword,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isEditor,
        role,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
