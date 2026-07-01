import { Loader2 } from 'lucide-react'

export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-3 text-ink-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`shimmer ${className}`} />
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-line bg-white px-4 py-3">
      <div className="shimmer h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-3 w-1/3" />
        <div className="shimmer h-3 w-1/2" />
      </div>
      <div className="shimmer h-6 w-16 rounded" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="shimmer h-4 w-1/3" />
      <div className="shimmer mt-3 h-3 w-2/3" />
      <div className="shimmer mt-2 h-3 w-1/2" />
    </div>
  )
}
