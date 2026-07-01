import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-lifted`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-line bg-canvas px-6 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-700">{message}</p>
    </Modal>
  )
}
