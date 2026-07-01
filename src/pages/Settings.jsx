import { useEffect, useState } from 'react'
import { Save, Palette, ToggleLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/ui/PageHeader.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { Skeleton } from '../components/ui/LoadingScreen.jsx'
import {
  getSiteSettings,
  saveSiteSettings,
  defaultSiteSettings,
} from '../firebase/services.js'

const FEATURES = [
  {
    key: 'showAnnouncement',
    label: 'Top announcement bar',
    description: 'Slim message bar at the very top of every page.',
  },
  {
    key: 'showLogoCloud',
    label: 'Client logo cloud',
    description: 'Row of partner logos shown on the homepage.',
  },
  {
    key: 'showTestimonials',
    label: 'Testimonials section',
    description: 'Show or hide the testimonials block site-wide.',
  },
  {
    key: 'showCaseStudies',
    label: 'Case studies',
    description: 'Toggles the /case-studies route and homepage section.',
  },
  {
    key: 'showResources',
    label: 'Resources / blog',
    description: 'Toggles the /resources route and navigation entry.',
  },
  {
    key: 'showStats',
    label: 'Headline stats',
    description: 'The 95% / 20× / 750+ numbers on the homepage.',
  },
  {
    key: 'showLiveChat',
    label: 'Live chat widget',
    description: 'Reserved for a third-party live chat embed.',
  },
  {
    key: 'enableContactForm',
    label: 'Contact form submissions',
    description: 'When off, the contact page shows email/phone only.',
  },
]

const THEMES = [
  { value: 'blue', label: 'Blue', swatch: '#1d4ed8' },
  { value: 'green', label: 'Green', swatch: '#047857' },
  { value: 'red', label: 'Red', swatch: '#b91c1c' },
  { value: 'violet', label: 'Violet', swatch: '#6d28d9' },
  { value: 'amber', label: 'Amber', swatch: '#b45309' },
  { value: 'ink', label: 'Ink', swatch: '#1f2937' },
]

export default function Settings() {
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
        features: { ...defaultSiteSettings.features, ...(data.features || {}) },
      })
    } catch (err) {
      console.error(err)
      toast.error('Could not load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function toggleFeature(key) {
    setValues((v) => ({
      ...v,
      features: { ...v.features, [key]: !v.features[key] },
    }))
  }

  function pickTheme(theme) {
    setValues((v) => ({ ...v, theme }))
  }

  async function save() {
    setSaving(true)
    try {
      await saveSiteSettings({
        theme: values.theme,
        features: values.features,
      })
      toast.success('Settings saved')
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <div className="card space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Theme and feature toggles for the public website."
        action={
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        }
      />

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Palette size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Theme</h2>
        </div>
        <p className="mb-5 text-sm text-ink-600">
          Pick the accent colour for the whole site. The base remains white with our
          editorial typography — only the accent changes.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {THEMES.map((t) => {
            const active = values.theme === t.value
            return (
              <button
                key={t.value}
                onClick={() => pickTheme(t.value)}
                className={`group relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition ${
                  active
                    ? 'border-accent-600 ring-2 ring-accent-600/20'
                    : 'border-line hover:border-ink-300'
                }`}
              >
                <span
                  className="h-10 w-10 rounded-md shadow-soft"
                  style={{ backgroundColor: t.swatch }}
                />
                <span className="font-medium text-ink-900">{t.label}</span>
                {active && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-white">
                    <Check size={12} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <ToggleLeft size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Features</h2>
        </div>
        <p className="mb-5 text-sm text-ink-600">
          Switch sections of the public site on or off without touching code.
        </p>
        <div className="divide-y divide-line">
          {FEATURES.map((f) => (
            <div key={f.key} className="py-4 first:pt-0 last:pb-0">
              <Toggle
                label={f.label}
                description={f.description}
                checked={!!values.features[f.key]}
                onChange={() => toggleFeature(f.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="card border-dashed bg-canvas-50/50 p-5 text-sm text-ink-600">
        <p>
          <strong className="text-ink-900">Tip:</strong> changes here take effect on
          the public site within a few seconds of saving — visitors see them on their
          next page navigation.
        </p>
      </div>
    </div>
  )
}
