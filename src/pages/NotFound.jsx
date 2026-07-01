import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink-900">
        We couldn’t find that page
      </h1>
      <p className="mt-3 max-w-md text-ink-600">
        It might have been renamed, or you may have typed the URL by hand. Head back
        to the dashboard to keep working.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          <ArrowLeft size={14} />
          Go back
        </button>
        <Link to="/dashboard" className="btn-primary">
          <Home size={14} />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
