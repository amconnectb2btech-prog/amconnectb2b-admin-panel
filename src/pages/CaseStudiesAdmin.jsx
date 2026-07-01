import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, BarChart3, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal, { ConfirmDialog } from '../components/ui/Modal.jsx'
import { SkeletonRow } from '../components/ui/LoadingScreen.jsx'
import {
  listCaseStudies,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from '../firebase/services.js'

const emptyForm = {
  client: '',
  sector: '',
  headline: '',
  summary: '',
  metrics: [{ n: '', l: '' }],
  order: 0,
  published: true,
}

export default function CaseStudiesAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await listCaseStudies()
      setItems(data)
    } catch (err) {
      console.error(err)
      toast.error('Could not load case studies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setForm({ ...emptyForm, order: items.length })
    setEditing('new')
  }

  function openEdit(item) {
    setForm({
      client: item.client || '',
      sector: item.sector || '',
      headline: item.headline || '',
      summary: item.summary || '',
      metrics: item.metrics?.length ? item.metrics : [{ n: '', l: '' }],
      order: item.order ?? 0,
      published: item.published ?? true,
    })
    setEditing(item.id)
  }

  function closeModal() {
    setEditing(null)
    setForm(emptyForm)
  }

  function updateMetric(i, key, val) {
    setForm((f) => {
      const next = [...f.metrics]
      next[i] = { ...next[i], [key]: val }
      return { ...f, metrics: next }
    })
  }

  function addMetric() {
    setForm((f) => ({ ...f, metrics: [...f.metrics, { n: '', l: '' }] }))
  }

  function removeMetric(i) {
    setForm((f) => ({
      ...f,
      metrics: f.metrics.filter((_, idx) => idx !== i),
    }))
  }

  async function save(e) {
    e.preventDefault()
    if (!form.client.trim() || !form.headline.trim()) {
      toast.error('Client and headline are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        metrics: form.metrics.filter((m) => m.n.trim() || m.l.trim()),
        order: Number(form.order) || 0,
      }
      if (editing === 'new') {
        await createCaseStudy(payload)
        toast.success('Case study created')
      } else {
        await updateCaseStudy(editing, payload)
        toast.success('Case study updated')
      }
      closeModal()
      load()
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item) {
    try {
      await updateCaseStudy(item.id, { published: !item.published })
      toast.success(item.published ? 'Unpublished' : 'Published')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteCaseStudy(deleteId)
      toast.success('Case study deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    }
  }

  const deleteItem = useMemo(
    () => items.find((i) => i.id === deleteId),
    [items, deleteId]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case studies"
        description="Highlight wins by client, sector, and the metrics that mattered."
        action={
          <button onClick={openNew} className="btn-primary">
            <Plus size={16} />
            New case study
          </button>
        }
      />

      {loading ? (
        <div className="card divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No case studies yet"
          description="Add proof points to bolster every service page and the case studies index."
          action={
            <button onClick={openNew} className="btn-primary">
              <Plus size={16} />
              Add the first one
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-start gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink-900">{item.client}</span>
                  {item.sector && (
                    <span className="pill bg-canvas-100 text-ink-600">
                      {item.sector}
                    </span>
                  )}
                  {!item.published && (
                    <span className="pill bg-amber-100 text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-ink-700">
                  {item.headline}
                </p>
                {item.metrics?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {item.metrics.slice(0, 4).map((m, i) => (
                      <span
                        key={i}
                        className="text-xs text-ink-500"
                      >
                        <span className="font-mono text-ink-900">{m.n}</span>
                        {m.l ? ` · ${m.l}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => togglePublish(item)}
                  className="rounded-md p-2 text-ink-500 hover:bg-canvas-100 hover:text-ink-900"
                  title={item.published ? 'Unpublish' : 'Publish'}
                >
                  {item.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="rounded-md p-2 text-ink-500 hover:bg-canvas-100 hover:text-ink-900"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="rounded-md p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={closeModal}
        title={editing === 'new' ? 'New case study' : 'Edit case study'}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Client</label>
              <input
                className="input"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                placeholder="e.g. GOb2b"
                required
              />
            </div>
            <div>
              <label className="label">Sector</label>
              <input
                className="input"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                placeholder="e.g. B2B Software"
              />
            </div>
          </div>

          <div>
            <label className="label">Headline</label>
            <input
              className="input"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="A short statement of the outcome"
              required
            />
          </div>

          <div>
            <label className="label">Summary</label>
            <textarea
              className="input min-h-[120px] resize-y"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Two or three sentences explaining the engagement and result."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Metrics</label>
              <button
                type="button"
                onClick={addMetric}
                className="text-sm font-medium text-accent-700 hover:underline"
              >
                + Add metric
              </button>
            </div>
            <div className="space-y-2">
              {form.metrics.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input w-32"
                    value={m.n}
                    onChange={(e) => updateMetric(i, 'n', e.target.value)}
                    placeholder="20×"
                  />
                  <input
                    className="input flex-1"
                    value={m.l}
                    onChange={(e) => updateMetric(i, 'l', e.target.value)}
                    placeholder="ROI in 12 months"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetric(i)}
                    className="rounded-md p-2 text-ink-500 hover:bg-canvas-100 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Order</label>
              <input
                type="number"
                className="input"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-line"
                />
                <span className="text-sm text-ink-900">Published</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save case study'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete case study?"
        description={
          deleteItem
            ? `“${deleteItem.headline}” will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
