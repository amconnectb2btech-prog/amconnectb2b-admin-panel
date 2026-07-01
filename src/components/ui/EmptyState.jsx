import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="card flex flex-col items-center px-8 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-ink-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-display text-lg text-ink-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-ink-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
