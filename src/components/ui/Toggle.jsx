export default function Toggle({ checked, onChange, label, description, id }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        {label && (
          <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink-900">
            {label}
          </label>
        )}
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        onClick={() => onChange(!checked)}
        className="toggle flex-none"
        data-on={checked ? 'true' : 'false'}
        role="switch"
        aria-checked={checked}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  )
}
