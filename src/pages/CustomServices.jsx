import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { listServices, deleteService, updateService } from '../firebase/services.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { ConfirmDialog } from '../components/ui/Modal.jsx'
import { SkeletonRow } from '../components/ui/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CustomServices() {
  const { can } = useAuth()
  const [items, setItems] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = async () => {
    setItems(null)
    try {
      const rows = await listServices()
      setItems(rows)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load services.')
      setItems([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const doDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteService(pendingDelete.id)
      setItems((rows) => rows.filter((r) => r.id !== pendingDelete.id))
      toast.success('Service deleted.')
    } catch (err) {
      toast.error('Could not delete service.')
    } finally {
      setPendingDelete(null)
    }
  }

  const togglePublished = async (svc) => {
    try {
      await updateService(svc.id, { published: !svc.published })
      setItems((rows) =>
        rows.map((r) => (r.id === svc.id ? { ...r, published: !r.published } : r))
      )
      toast.success(svc.published ? 'Unpublished.' : 'Published.')
    } catch (err) {
      toast.error('Could not update.')
    }
  }

  return (
    <>
      <PageHeader
        title="Custom services"
        description="Service pages managed here are rendered at /solutions/<slug> on the website."
        action={
          can('manage_content') && (
            <Link to="/services/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              New service
            </Link>
          )
        }
      />

      <div className="card overflow-hidden">
        {items === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No custom services yet"
              description="Create a custom service page for a sector campaign or special offering. It will be live on the site as soon as you publish it."
              action={
                can('manage_content') && (
                  <Link to="/services/new" className="btn-primary">
                    <Plus className="h-4 w-4" /> Create first service
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-canvas"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <GripVertical className="h-4 w-4 flex-none text-ink-300" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{s.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      <code className="rounded bg-canvas px-1 py-0.5 font-mono">
                        /solutions/{s.slug}
                      </code>
                      {s.tagline ? ` · ${s.tagline}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublished(s)}
                    className={`pill cursor-pointer ${
                      s.published
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-line bg-canvas text-ink-500'
                    }`}
                  >
                    {s.published ? 'Published' : 'Draft'}
                  </button>
                  {s.published && (
                    <a
                      href={`https://amconnectb2b.com/solutions/${s.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-2 text-ink-500 hover:bg-white hover:text-ink-900"
                      title="Open on site"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Link
                    to={`/services/${s.id}`}
                    className="rounded-md p-2 text-ink-500 hover:bg-white hover:text-ink-900"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
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

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={doDelete}
        title="Delete service?"
        message={`This will permanently remove "${pendingDelete?.title}". The /solutions/${pendingDelete?.slug} URL will return a 404.`}
      />
    </>
  )
}
