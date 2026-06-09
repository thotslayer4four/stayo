import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-zinc-900 mb-4">404</p>
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">Page not found</h1>
        <p className="text-sm text-zinc-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          Back to browse
        </Link>
      </div>
    </div>
  )
}
