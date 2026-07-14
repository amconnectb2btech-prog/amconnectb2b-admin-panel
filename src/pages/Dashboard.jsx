import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  Layers,
  Quote,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { getDashboardCounts, listContactSubmissions } from '../firebase/services.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { SkeletonCard } from '../components/ui/LoadingScreen.jsx'

export default function Dashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState(null)
  const [recent, setRecent] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([getDashboardCounts(), listContactSubmissions(5)])
      .then(([c, r]) => {
        if (!mounted) return
        setCounts(c)
        setRecent(r)
      })
      .catch((err) => console.error(err))
    return () => {
      mounted = false
    }
  }, [])

  const cards = [
    {
      label: 'Contact submissions',
      icon: Inbox,
      value: counts?.totalSubmissions,
      sub: counts ? `${counts.newSubmissions} new` : null,
      to: '/submissions',
    },
    {
      label: 'Custom services',
      icon: Layers,
      value: counts?.services,
      to: '/services',
    },
    {
      label: 'Testimonials',
      icon: Quote,
      value: counts?.testimonials,
      to: '/testimonials',
    },
    {
      label: 'Case studies',
      icon: BookOpen,
      value: counts?.caseStudies,
      to: '/case-studies',
    },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}.`}
        description="A snapshot of the website's content and inbox."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <Link
              to={c.to}
              key={i}
              className="card group p-5 transition hover:shadow-lifted"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-canvas text-ink-700">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-700" />
              </div>
              {counts === null ? (
                <div className="shimmer mt-5 h-7 w-16 rounded" />
              ) : (
                <p className="mt-5 font-display text-3xl text-ink-900">{c.value ?? 0}</p>
              )}
              <p className="mt-1 text-sm text-ink-500">{c.label}</p>
              {c.sub && (
                <p className="mt-2 text-xs font-medium text-accent-700">{c.sub}</p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Recent submissions */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900">Recent submissions</h2>
          <Link
            to="/submissions"
            className="text-sm text-accent-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="card overflow-hidden">
          {recent === null ? (
            <div className="divide-y divide-line">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-500">
              No submissions yet. They'll appear here as soon as someone fills in the contact form.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {s.name || 'Unknown'} <span className="text-ink-400">·</span>{' '}
                      <span className="text-ink-500">{s.email}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      {s.interest || 'No topic'} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={s.status || 'new'} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Helpful next actions */}
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-accent-700">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Tip</span>
          </div>
          <h3 className="mt-3 font-display text-lg text-ink-900">
            Add a custom solution page
          </h3>
          <p className="mt-2 text-sm text-ink-500">
            Spin up a new service page for a specific sector or campaign. It will render under
            <code className="mx-1 rounded bg-canvas px-1.5 py-0.5 font-mono text-xs">
              /solutions/&lt;slug&gt;
            </code>
            and appear in the website's mega-menu.
          </p>
          <Link to="/services/new" className="btn-secondary mt-5">
            Create service <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-accent-700">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Tip</span>
          </div>
          <h3 className="mt-3 font-display text-lg text-ink-900">
            Switch the site's theme
          </h3>
          <p className="mt-2 text-sm text-ink-500">
            Pick from six accent themes blue, green, red, violet, amber, ink under Settings.
            The website applies the change instantly.
          </p>
          <Link to="/settings" className="btn-secondary mt-5">
            Open settings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

function StatusPill({ status }) {
  const map = {
    new: 'bg-accent-50 text-accent-700 border-accent-200',
    read: 'bg-canvas text-ink-700 border-line',
    replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    archived: 'bg-ink-100 text-ink-500 border-line',
  }
  return (
    <span className={`pill ${map[status] || map.new}`}>
      {status}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
