import { useEffect, useState, useMemo } from 'react'
import { Search, Trash2, Eye, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  listContactSubmissions,
  markSubmissionStatus,
  deleteSubmission,
} from '../firebase/services.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Modal, { ConfirmDialog } from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { SkeletonRow } from '../components/ui/LoadingScreen.jsx'

const STATUSES = ['all', 'new', 'read', 'replied', 'archived']

export default function ContactSubmissions() {
  const { can } = useAuth()
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = async () => {
    setItems(null)
    try {
      const rows = await listContactSubmissions()
      setItems(rows)
    } catch (err) {
      toast.error('Failed to load submissions.')
      setItems([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    const q = search.trim().toLowerCase()
    return items.filter((s) => {
      if (filter !== 'all' && (s.status || 'new') !== filter) return false
      if (!q) return true
      return [s.name, s.email, s.company, s.message, s.interest]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [items, filter, search])

  const updateStatus = async (id, status) => {
    try {
      await markSubmissionStatus(id, status)
      setItems((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(`Marked as ${status}.`)
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch (err) {
      toast.error('Could not update status.')
    }
  }

  const doDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteSubmission(pendingDelete.id)
      setItems((rows) => rows.filter((r) => r.id !== pendingDelete.id))
      toast.success('Submission deleted.')
      if (selected?.id === pendingDelete.id) setSelected(null)
    } catch (err) {
      toast.error('Could not delete.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Contact submissions"
        description="Every message sent through the website's contact form lands here."
      />

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  filter === s
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-line bg-white text-ink-700 hover:bg-canvas'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-64 pl-9"
            />
          </div>
        </div>

        {/* List */}
        {items === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No submissions"
              description={
                items.length === 0
                  ? 'When someone fills in the contact form, it will appear here.'
                  : 'No submissions match your current filter.'
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-canvas"
              >
                <button
                  onClick={() => setSelected(s)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {s.name || 'Unknown'}
                    </p>
                    <StatusPill status={s.status || 'new'} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {s.email}
                    {s.company ? ` · ${s.company}` : ''}
                    {s.interest ? ` · ${s.interest}` : ''}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-xs text-ink-600">
                    {s.message}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelected(s)}
                    className="rounded-md p-2 text-ink-500 hover:bg-white hover:text-ink-900"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {can('delete_content') && (
                    <button
                      onClick={() => setPendingDelete(s)}
                      className="rounded-md p-2 text-ink-500 hover:bg-red-50 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Submission detail"
        size="lg"
        footer={
          selected && (
            <>
              <select
                value={selected.status || 'new'}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="input w-auto"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <a
                href={`mailto:${selected.email}?subject=Re: your enquiry to AMCONNECTB2B`}
                className="btn-primary"
                onClick={() => updateStatus(selected.id, 'replied')}
              >
                Reply by email <Check className="h-4 w-4" />
              </a>
            </>
          )
        }
      >
        {selected && (
          <dl className="space-y-4 text-sm">
            <Row label="Name" value={selected.name} />
            <Row label="Email" value={<a href={`mailto:${selected.email}`} className="text-accent-700 hover:underline">{selected.email}</a>} />
            <Row label="Company" value={selected.company} />
            <Row label="Phone" value={selected.phone} />
            <Row label="Interest" value={selected.interest} />
            <Row label="Source" value={selected.source} />
            <Row label="Received" value={formatDate(selected.createdAt)} />
            <div className="border-t border-line pt-4">
              <dt className="font-medium text-ink-700">Message</dt>
              <dd className="mt-2 whitespace-pre-wrap rounded-md bg-canvas p-4 text-ink-700">
                {selected.message}
              </dd>
            </div>
            {selected.userAgent && (
              <Row
                label="User agent"
                value={<span className="font-mono text-xs text-ink-500">{selected.userAgent}</span>}
              />
            )}
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={doDelete}
        title="Delete submission?"
        message={`This will permanently remove the submission from ${pendingDelete?.name || 'this contact'}. This cannot be undone.`}
      />
    </>
  )
}

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="grid gap-1 sm:grid-cols-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="sm:col-span-3">{value}</dd>
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    new: 'bg-accent-50 text-accent-700 border-accent-200',
    read: 'bg-canvas text-ink-700 border-line',
    replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    archived: 'bg-ink-100 text-ink-500 border-line',
  }
  return <span className={`pill ${map[status] || map.new}`}>{status}</span>
}

function formatDate(ts) {
  if (!ts) return ''
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString()
}
