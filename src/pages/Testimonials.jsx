import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../firebase/services.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal, { ConfirmDialog } from '../components/ui/Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { SkeletonRow } from '../components/ui/LoadingScreen.jsx'

const emptyForm = { quote: '', name: '', title: '', company: '', order: 100, published: true }

export default function Testimonials() {
  const { can } = useAuth()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null) // null | {} (new) | item (existing)
  const [form, setForm] = useState(emptyForm)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setItems(null)
    try {
      setItems(await listTestimonials())
    } catch (err) {
      console.error(err)
      toast.error('Failed to load testimonials.')
      setItems([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing({})
    setForm(emptyForm)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ ...emptyForm, ...item })
  }

  const handleSave = async () => {
    if (!form.quote.trim() || !form.name.trim()) {
      toast.error('Quote and name are required.')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, order: Number(form.order) || 100 }
      if (editing?.id) {
        await updateTestimonial(editing.id, payload)
        toast.success('Updated.')
      } else {
        await createTestimonial(payload)
        toast.success('Added.')
      }
      setEditing(null)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteTestimonial(pendingDelete.id)
      toast.success('Deleted.')
      setItems((rows) => rows.filter((r) => r.id !== pendingDelete.id))
    } catch (err) {
      toast.error('Could not delete.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Quotes shown on the home page. Drag-friendly order field controls display order."
        action={
          can('manage_content') && (
            <button onClick={openNew} className="btn-primary">
              <Plus className="h-4 w-4" /> Add testimonial
            </button>
          )
        }
      />

      <div className="card overflow-hidden">
        {items === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No testimonials yet"
              description="Add your first client quote to feature it on the home page."
              action={
                can('manage_content') && (
                  <button onClick={openNew} className="btn-primary">
                    <Plus className="h-4 w-4" /> Add testimonial
                  </button>
                )
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm italic text-ink-700">"{t.quote}"</p>
                  <p className="mt-2 text-xs text-ink-500">
                    <span className="font-medium text-ink-900">{t.name}</span>
                    {t.title ? ` · ${t.title}` : ''}
                    {t.company ? ` · ${t.company}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`pill ${
                      t.published
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-line bg-canvas text-ink-500'
                    }`}
                  >
                    {t.published ? 'Live' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded-md p-2 text-ink-500 hover:bg-canvas hover:text-ink-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {can('delete_content') && (
                    <button
                      onClick={() => setPendingDelete(t)}
                      className="rounded-md p-2 text-ink-500 hover:bg-red-50 hover:text-red-700"
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

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit testimonial' : 'New testimonial'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Quote</label>
            <textarea
              className="input mt-1.5 min-h-[100px]"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input
                className="input mt-1.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Title / role</label>
              <input
                className="input mt-1.5"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Company</label>
              <input
                className="input mt-1.5"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Display order</label>
              <input
                type="number"
                className="input mt-1.5"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-line bg-canvas p-3">
            <span className="text-sm">Published</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className="toggle"
              data-on={form.published ? 'true' : 'false'}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={doDelete}
        title="Delete testimonial?"
        message={`This will remove the testimonial from ${pendingDelete?.name || 'this person'} from the website.`}
      />
    </>
  )
}
