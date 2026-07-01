import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, UserPlus, ShieldCheck, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal, { ConfirmDialog } from '../components/ui/Modal.jsx'
import { SkeletonRow } from '../components/ui/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  listAdminUsers,
  getAdminUserByEmail,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  ADMIN_ROLES,
  ROLE_LABELS,
} from '../firebase/services.js'

const roleOptions = [
  { value: ADMIN_ROLES.SUPER_ADMIN, label: ROLE_LABELS[ADMIN_ROLES.SUPER_ADMIN] },
  { value: ADMIN_ROLES.ADMIN, label: ROLE_LABELS[ADMIN_ROLES.ADMIN] },
  { value: ADMIN_ROLES.EDITOR, label: ROLE_LABELS[ADMIN_ROLES.EDITOR] },
]

const roleStyles = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'bg-accent-50 text-accent-700',
  [ADMIN_ROLES.ADMIN]: 'bg-violet-50 text-violet-700',
  [ADMIN_ROLES.EDITOR]: 'bg-canvas-100 text-ink-700',
}

export default function AdminUsers() {
  const { user: currentUser, can } = useAuth()
  const allowed = can('manage_users')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: ADMIN_ROLES.EDITOR,
  })
  const [deleteUid, setDeleteUid] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await listAdminUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
      toast.error('Could not load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (allowed) load()
    else setLoading(false)
  }, [allowed])

  function openNew() {
    setForm({ email: '', name: '', role: ADMIN_ROLES.EDITOR })
    setModalOpen(true)
  }

  async function invite(e) {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    setSaving(true)
    try {
      // Look up to see if user already exists in adminUsers by email
      const existing = await getAdminUserByEmail(email)
      if (existing) {
        toast.error('That email already has an admin profile')
        setSaving(false)
        return
      }
      // Stage profile by email (no uid yet — first sign-in via Firebase Auth
      // password reset will create uid; admin should then link manually or
      // we use email as docId as a placeholder).
      await createAdminUser(`pending_${email.replace(/[^a-z0-9]/g, '_')}`, {
        email,
        name: form.name.trim(),
        role: form.role,
        pending: true,
      })
      toast.success('Invitation staged. Ask the user to sign in via password reset.')
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Could not invite user')
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(user, role) {
    if (user.uid === currentUser?.uid) {
      toast.error('You cannot change your own role')
      return
    }
    try {
      await updateAdminUser(user.uid, { role })
      toast.success('Role updated')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    }
  }

  async function confirmDelete() {
    if (!deleteUid) return
    if (deleteUid === currentUser?.uid) {
      toast.error('You cannot remove yourself')
      setDeleteUid(null)
      return
    }
    try {
      await deleteAdminUser(deleteUid)
      toast.success('Admin removed')
      setDeleteUid(null)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    }
  }

  const deleteTarget = useMemo(
    () => users.find((u) => u.uid === deleteUid),
    [users, deleteUid]
  )

  if (!allowed) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin users"
          description="Manage who has access to this panel."
        />
        <EmptyState
          icon={ShieldCheck}
          title="Not authorised"
          description="Only Super Admins can manage other admin users."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin users"
        description="Invite teammates and assign roles. Roles control what each admin can do."
        action={
          <button onClick={openNew} className="btn-primary">
            <UserPlus size={16} />
            Invite admin
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-canvas-50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-ink-500">
          <div className="grid grid-cols-12 gap-4">
            <span className="col-span-5">User</span>
            <span className="col-span-4">Role</span>
            <span className="col-span-3 text-right">Actions</span>
          </div>
        </div>
        {loading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UserPlus}
              title="No admins yet"
              description="Invite your first admin teammate to start collaborating."
              action={
                <button onClick={openNew} className="btn-primary">
                  <Plus size={16} />
                  Invite admin
                </button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {users.map((u) => {
              const isSelf = u.uid === currentUser?.uid
              return (
                <div key={u.uid} className="grid grid-cols-12 items-center gap-4 px-5 py-4">
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas-100 text-sm font-medium text-ink-700">
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-ink-900">
                            {u.name || u.email}
                          </p>
                          {isSelf && (
                            <span className="pill bg-accent-50 text-accent-700">You</span>
                          )}
                          {u.pending && (
                            <span className="pill bg-amber-100 text-amber-800">Pending</span>
                          )}
                        </div>
                        <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                          <Mail size={12} />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    {isSelf ? (
                      <span className={`pill ${roleStyles[u.role] || roleStyles[ADMIN_ROLES.EDITOR]}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role || ADMIN_ROLES.EDITOR}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="input max-w-[200px] py-1.5 text-sm"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => setDeleteUid(u.uid)}
                      disabled={isSelf}
                      className="rounded-md p-2 text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-500"
                      title={isSelf ? 'Cannot remove yourself' : 'Remove'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-ink-900">How roles work</p>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          <li>
            <strong className="text-ink-900">Super Admin</strong> — full access including
            managing other admins and Firebase settings.
          </li>
          <li>
            <strong className="text-ink-900">Admin</strong> — manages all content,
            submissions, and site settings, but cannot add or remove admins.
          </li>
          <li>
            <strong className="text-ink-900">Editor</strong> — can edit services,
            testimonials, case studies, and site content. No access to settings or users.
          </li>
        </ul>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Invite admin"
      >
        <form onSubmit={invite} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="teammate@amconnectb2b.com"
              required
            />
            <p className="mt-1 text-xs text-ink-500">
              They will need to be added as a Firebase Auth user separately.
            </p>
          </div>
          <div>
            <label className="label">Name (optional)</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Inviting…' : 'Send invitation'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteUid}
        onClose={() => setDeleteUid(null)}
        onConfirm={confirmDelete}
        title="Remove admin?"
        description={
          deleteTarget
            ? `${deleteTarget.name || deleteTarget.email} will lose access to this panel. Their Firebase Auth account is not deleted.`
            : ''
        }
        confirmLabel="Remove"
        danger
      />
    </div>
  )
}
