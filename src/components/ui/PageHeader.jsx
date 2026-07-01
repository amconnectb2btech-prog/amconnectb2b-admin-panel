export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-3xl text-ink-900">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>
        )}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  )
}
