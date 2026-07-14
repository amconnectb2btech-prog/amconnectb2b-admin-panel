import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getService,
  createService,
  updateService,
} from '../firebase/services.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import LoadingScreen from '../components/ui/LoadingScreen.jsx'

const empty = {
  title: '',
  slug: '',
  tagline: '',
  intro: [''],
  whatYouGet: [''],
  process: [{ t: '', d: '' }],
  faqs: [{ q: '', a: '' }],
  body: '',
  order: 100,
  published: false,
}

export default function CustomServiceEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    let mounted = true
    getService(id)
      .then((doc) => {
        if (!mounted) return
        if (!doc) {
          toast.error('Service not found.')
          navigate('/services')
          return
        }
        setForm({
          ...empty,
          ...doc,
          intro: doc.intro?.length ? doc.intro : [''],
          whatYouGet: doc.whatYouGet?.length ? doc.whatYouGet : [''],
          process: doc.process?.length ? doc.process : [{ t: '', d: '' }],
          faqs: doc.faqs?.length ? doc.faqs : [{ q: '', a: '' }],
        })
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id, isNew, navigate])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const slugify = (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleTitleChange = (value) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: !id && (!f.slug || f.slug === slugify(f.title)) ? slugify(value) : f.slug,
    }))
  }

  const updateListItem = (field, idx, value) => {
    setForm((f) => {
      const arr = [...f[field]]
      arr[idx] = value
      return { ...f, [field]: arr }
    })
  }

  const updateObjListItem = (field, idx, key, value) => {
    setForm((f) => {
      const arr = [...f[field]]
      arr[idx] = { ...arr[idx], [key]: value }
      return { ...f, [field]: arr }
    })
  }

  const addToList = (field, item) =>
    setForm((f) => ({ ...f, [field]: [...f[field], item] }))

  const removeFromList = (field, idx) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].filter((_, i) => i !== idx),
    }))

  const handleSave = async (publishToggle = null) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: slugify(form.slug),
        intro: form.intro.filter((p) => p.trim()),
        whatYouGet: form.whatYouGet.filter((p) => p.trim()),
        process: form.process.filter((p) => p.t || p.d),
        faqs: form.faqs.filter((p) => p.q || p.a),
        published: publishToggle ?? form.published,
        order: Number(form.order) || 100,
      }
      if (isNew) {
        const newId = await createService(payload)
        toast.success('Service created.')
        navigate(`/services/${newId}`, { replace: true })
      } else {
        await updateService(id, payload)
        toast.success('Saved.')
        setForm((f) => ({ ...f, published: payload.published }))
      }
    } catch (err) {
      console.error(err)
      toast.error('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen label="Loading service..." />

  return (
    <>
      <Link
        to="/services"
        className="mb-4 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <PageHeader
        title={isNew ? 'New custom service' : 'Edit service'}
        description={
          isNew
            ? 'Build a new service page. It will live at /solutions/<slug> on the website.'
            : `Live URL: /solutions/${form.slug}`
        }
        action={
          <>
            <button
              onClick={() => handleSave(!form.published)}
              disabled={saving}
              className="btn-secondary"
            >
              {form.published ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={() => handleSave()} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isNew ? 'Create' : 'Save'}
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Basics">
            <Field
              label="Title"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. ABM programs for fintech"
            />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(v) => update('slug', slugify(v))}
              prefix="/solutions/"
              placeholder="abm-for-fintech"
            />
            <Field
              label="Tagline"
              value={form.tagline}
              onChange={(v) => update('tagline', v)}
              placeholder="One sentence that sits under the title."
            />
          </Card>

          <Card title="Intro paragraphs">
            <ListEditor
              items={form.intro}
              onItemChange={(i, v) => updateListItem('intro', i, v)}
              onAdd={() => addToList('intro', '')}
              onRemove={(i) => removeFromList('intro', i)}
              placeholder="A paragraph describing this solution."
              multiline
            />
          </Card>

          <Card title="What you get">
            <ListEditor
              items={form.whatYouGet}
              onItemChange={(i, v) => updateListItem('whatYouGet', i, v)}
              onAdd={() => addToList('whatYouGet', '')}
              onRemove={(i) => removeFromList('whatYouGet', i)}
              placeholder="A deliverable, in one line."
            />
          </Card>

          <Card title="Process steps">
            {form.process.map((step, i) => (
              <div
                key={i}
                className="mb-3 grid gap-2 rounded-md border border-line bg-canvas p-3 last:mb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-500">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromList('process', i)}
                    className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Title (e.g. Understand)"
                  value={step.t}
                  onChange={(e) => updateObjListItem('process', i, 't', e.target.value)}
                />
                <textarea
                  className="input min-h-[60px]"
                  placeholder="Short description of the step."
                  value={step.d}
                  onChange={(e) => updateObjListItem('process', i, 'd', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToList('process', { t: '', d: '' })}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4" /> Add step
            </button>
          </Card>

          <Card title="FAQs">
            {form.faqs.map((f, i) => (
              <div
                key={i}
                className="mb-3 grid gap-2 rounded-md border border-line bg-canvas p-3 last:mb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-500">FAQ {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFromList('faqs', i)}
                    className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Question"
                  value={f.q}
                  onChange={(e) => updateObjListItem('faqs', i, 'q', e.target.value)}
                />
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Answer"
                  value={f.a}
                  onChange={(e) => updateObjListItem('faqs', i, 'a', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToList('faqs', { q: '', a: '' })}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </Card>

          <Card title="Long-form body (optional, HTML)">
            <textarea
              className="input min-h-[180px] font-mono text-xs"
              placeholder="<p>Any extra HTML content for this page.</p>"
              value={form.body}
              onChange={(e) => update('body', e.target.value)}
            />
            <p className="mt-2 text-xs text-ink-500">
              Use this for free-form sections beyond the structured fields above. Simple HTML
              tags only no scripts.
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card title="Status">
            <div className="flex items-center justify-between rounded-md border border-line bg-canvas p-3">
              <span className="text-sm text-ink-700">
                {form.published ? 'Published' : 'Draft'}
              </span>
              <button
                type="button"
                onClick={() => update('published', !form.published)}
                className="toggle"
                data-on={form.published ? 'true' : 'false'}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </Card>

          <Card title="Display order">
            <input
              type="number"
              className="input"
              value={form.order}
              onChange={(e) => update('order', e.target.value)}
            />
            <p className="mt-2 text-xs text-ink-500">
              Lower numbers appear first on the website's services listings.
            </p>
          </Card>

          <Card title="Preview">
            <p className="text-xs text-ink-500">Once saved and published:</p>
            <a
              href={`https://amconnectb2b.com/solutions/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block break-all font-mono text-xs text-accent-700 hover:underline"
            >
              amconnectb2b.com/solutions/{form.slug || '...'}
            </a>
          </Card>
        </aside>
      </div>
    </>
  )
}

function Card({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 font-display text-base text-ink-900">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, value, onChange, placeholder, prefix }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="label">{label}</label>
      <div className="mt-1.5 flex">
        {prefix && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-line bg-canvas px-3 font-mono text-xs text-ink-500">
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input ${prefix ? 'rounded-l-none' : ''}`}
        />
      </div>
    </div>
  )
}

function ListEditor({ items, onItemChange, onAdd, onRemove, placeholder, multiline }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="mb-2 flex gap-2 last:mb-0">
          {multiline ? (
            <textarea
              className="input min-h-[70px] flex-1"
              value={item}
              placeholder={placeholder}
              onChange={(e) => onItemChange(i, e.target.value)}
            />
          ) : (
            <input
              className="input flex-1"
              value={item}
              placeholder={placeholder}
              onChange={(e) => onItemChange(i, e.target.value)}
            />
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="rounded-md border border-line bg-white p-2 text-ink-400 hover:bg-red-50 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="btn-secondary mt-2">
        <Plus className="h-4 w-4" /> Add
      </button>
    </>
  )
}
