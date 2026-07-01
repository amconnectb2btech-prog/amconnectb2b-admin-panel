import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn, resetPassword, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signin') // signin | reset

  if (isAuthenticated) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) return setError('Email and password are required.')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(prettifyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) return setError('Enter your email and we\'ll send a reset link.')
    setSubmitting(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent.')
      setMode('signin')
    } catch (err) {
      setError(prettifyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded bg-ink-950 font-display text-white">
              a
            </span>
            <span className="font-display text-lg text-ink-900">
              amconnectb2b<span className="text-accent-700">.</span>
            </span>
          </div>
          <h1 className="mt-12 font-display text-3xl text-ink-900">
            {mode === 'signin' ? 'Sign in' : 'Reset password'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {mode === 'signin'
              ? 'Manage the AMCONNECTB2B website content, users, and settings.'
              : "We'll email you a link to set a new password."}
          </p>

          <form
            onSubmit={mode === 'signin' ? handleSubmit : handleReset}
            className="mt-8 space-y-4"
          >
            <div>
              <label className="label">Email</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input pl-9"
                  placeholder="you@amconnectb2b.com"
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-accent-700 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="input pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-primary w-full"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                'Send reset email'
              )}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="block w-full text-center text-xs text-ink-500 hover:text-ink-900"
              >
                Back to sign in
              </button>
            )}
          </form>

          <p className="mt-12 text-xs text-ink-400">
            Only invited admin users can sign in. Need access? Contact your super-admin.
          </p>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(29,78,216,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,109,245,0.3), transparent 50%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <span className="font-mono text-sm text-accent-400">/ admin panel</span>
          <div>
            <p className="font-display text-4xl font-light leading-tight">
              Manage your B2B pipeline content, one workspace.
            </p>
            <p className="mt-4 max-w-md text-ink-300">
              Custom services, testimonials, case studies, contact submissions, feature flags,
              and theme — all from one dashboard.
            </p>
          </div>
          <div className="text-xs text-ink-400">
            <p>AMCONNECTB2B Private Limited</p>
            <p className="mt-1">CIN: U70200PN2026PTC254443</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function prettifyError(err) {
  const code = err?.code || ''
  const map = {
    'auth/invalid-email': 'That email doesn\'t look right.',
    'auth/user-not-found': 'No admin account with that email.',
    'auth/wrong-password': 'Wrong password — try again, or reset it.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || err?.message || 'Something went wrong. Please try again.'
}
