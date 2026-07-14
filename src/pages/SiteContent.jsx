import { useEffect, useState } from 'react'
import { Save, Mail, Phone, MapPin, Megaphone } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/ui/PageHeader.jsx'
import { Skeleton } from '../components/ui/LoadingScreen.jsx'
import {
  getSiteSettings,
  saveSiteSettings,
  defaultSiteSettings,
} from '../firebase/services.js'

export default function SiteContent() {
  const [values, setValues] = useState(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getSiteSettings()
      setValues({
        ...defaultSiteSettings,
        ...data,
        contact: { ...defaultSiteSettings.contact, ...(data.contact || {}) },
        announcement: {
          ...defaultSiteSettings.announcement,
          ...(data.announcement || {}),
        },
      })
    } catch (err) {
      console.error(err)
      toast.error('Could not load site content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setSaving(true)
    try {
      await saveSiteSettings({
        contact: values.contact,
        announcement: values.announcement,
      })
      toast.success('Site content saved')
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function setContact(key, val) {
    setValues((v) => ({ ...v, contact: { ...v.contact, [key]: val } }))
  }

  function setAnnouncement(key, val) {
    setValues((v) => ({
      ...v,
      announcement: { ...v.announcement, [key]: val },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Site content" />
        <div className="card space-y-3 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site content"
        description="Edit content shared across the public site contact details and the top announcement."
        action={
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Mail size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Contact details</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <Mail size={12} /> Email
              </span>
            </label>
            <input
              className="input"
              value={values.contact.email}
              onChange={(e) => setContact('email', e.target.value)}
              placeholder="hello@amconnectb2b.com"
            />
          </div>
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <Phone size={12} /> Phone
              </span>
            </label>
            <input
              className="input"
              value={values.contact.phone}
              onChange={(e) => setContact('phone', e.target.value)}
              placeholder="+91 …"
            />
          </div>
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> Address
              </span>
            </label>
            <textarea
              className="input min-h-[100px] resize-y"
              value={values.contact.address}
              onChange={(e) => setContact('address', e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-500">
              Appears in the website footer and on the contact page.
            </p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Megaphone size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Top announcement</h2>
        </div>
        <p className="mb-4 text-sm text-ink-600">
          The slim bar that appears above the navbar. Toggle visibility under{' '}
          <strong className="text-ink-900">Settings → Features</strong>.
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Message</label>
            <input
              className="input"
              value={values.announcement.text}
              onChange={(e) => setAnnouncement('text', e.target.value)}
              placeholder="Now accepting new B2B engagements for Q3."
            />
          </div>
          <div>
            <label className="label">Link target</label>
            <input
              className="input"
              value={values.announcement.href}
              onChange={(e) => setAnnouncement('href', e.target.value)}
              placeholder="/contact"
            />
            <p className="mt-1 text-xs text-ink-500">
              Internal path (e.g. <code>/contact</code>) or full URL.
            </p>
          </div>
        </div>
      </section>

      <div className="card border-dashed bg-canvas-50/50 p-5 text-sm text-ink-600">
        <p>
          Looking for the <strong>theme</strong> or <strong>feature toggles</strong>?
          Head over to the <strong>Settings</strong> tab in the sidebar.
        </p>
      </div>
    </div>
  )
}
