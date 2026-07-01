import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import toast from 'react-hot-toast'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../firebase/services.js'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, signOut, role } = useAuth()
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  async function changePassword(e) {
    e.preventDefault()
    if (pwForm.next.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, pwForm.current)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, pwForm.next)
      toast.success('Password updated')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect')
      } else {
        toast.error('Could not update password')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.name || user?.displayName || user?.email
  const initial = (displayName || '?')[0].toUpperCase()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your profile"
        description="Account details and password."
      />

      <section className="card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-50 font-display text-2xl text-accent-700">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <User size={14} className="text-ink-500" />
              <p className="text-xs uppercase tracking-wider text-ink-500">Name</p>
            </div>
            <p className="mt-1 text-lg font-medium text-ink-900">{displayName}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-ink-500">Email</p>
            <p className="mt-1 text-ink-900">{user?.email}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-500">
              <ShieldCheck size={12} /> Role
            </p>
            <p className="mt-1">
              <span className="pill bg-accent-50 text-accent-700">
                {ROLE_LABELS[role] || role || 'No role'}
              </span>
            </p>
          </div>
          <button onClick={handleSignOut} className="btn-secondary">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <KeyRound size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="max-w-md space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
