import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, MessageSquare, PieChart as PieIcon, Inbox } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { Skeleton } from '../components/ui/LoadingScreen.jsx'
import { listContactSubmissions } from '../firebase/services.js'

const STATUS_COLORS = {
  new: '#2563eb',
  read: '#0891b2',
  replied: '#059669',
  archived: '#6b7280',
}

const PIE_COLORS = ['#1d4ed8', '#0891b2', '#059669', '#b45309', '#6d28d9', '#b91c1c']

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon size={14} />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl text-ink-900">{value}</p>
    </div>
  )
}

export default function Analytics() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    listContactSubmissions(500)
      .then((rows) => alive && setSubmissions(rows))
      .catch((e) => console.error(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // Build time-series for the last 30 days
  const timeSeries = useMemo(() => {
    const days = []
    const map = new Map()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      map.set(key, { date: key, label, count: 0 })
      days.push(key)
    }
    submissions.forEach((s) => {
      const ts = s.createdAt?.toDate ? s.createdAt.toDate() : null
      if (!ts) return
      const key = ts.toISOString().slice(0, 10)
      const row = map.get(key)
      if (row) row.count++
    })
    return days.map((k) => map.get(k))
  }, [submissions])

  const statusData = useMemo(() => {
    const counts = { new: 0, read: 0, replied: 0, archived: 0 }
    submissions.forEach((s) => {
      const k = s.status || 'new'
      counts[k] = (counts[k] || 0) + 1
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [submissions])

  const interestData = useMemo(() => {
    const counts = new Map()
    submissions.forEach((s) => {
      const k = s.interest || 'unspecified'
      counts.set(k, (counts.get(k) || 0) + 1)
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [submissions])

  const total = submissions.length
  const last30 = timeSeries.reduce((a, b) => a + b.count, 0)
  const newCount = submissions.filter((s) => (s.status || 'new') === 'new').length

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="A read-only view of contact form submissions and how they cluster."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile icon={Inbox} label="Total submissions" value={total} />
        <StatTile icon={TrendingUp} label="Last 30 days" value={last30} />
        <StatTile icon={MessageSquare} label="Awaiting response" value={newCount} />
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-accent-700" />
          <h2 className="font-medium text-ink-900">Submissions over time</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon size={16} className="text-accent-700" />
            <h2 className="font-medium text-ink-900">Status distribution</h2>
          </div>
          {statusData.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-500">
              No data yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.name] || PIE_COLORS[i]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-accent-700" />
            <h2 className="font-medium text-ink-900">Top interests</h2>
          </div>
          {interestData.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-500">
              No data yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={interestData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="card border-dashed bg-canvas-50/50 p-5 text-sm text-ink-600">
        <p>
          This view reads directly from <code>contactSubmissions</code>. For deeper
          marketing analytics, plug a tool like Plausible or GA4 into the public site.
        </p>
      </div>
    </div>
  )
}
