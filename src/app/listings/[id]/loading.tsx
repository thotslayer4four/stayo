export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Navbar placeholder */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-zinc-100" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Back link */}
        <div className="h-4 w-16 bg-zinc-200 rounded mb-6" />

        {/* Title block */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-zinc-200 rounded-full" />
            <div className="h-4 w-16 bg-zinc-200 rounded" />
          </div>
          <div className="h-9 bg-zinc-200 rounded-xl w-2/3" />
        </div>

        {/* Gallery placeholder */}
        <div className="aspect-[16/9] rounded-2xl bg-zinc-200 mb-10" />

        {/* Content + panel */}
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="h-5 w-40 bg-zinc-200 rounded" />
              <div className="h-4 bg-zinc-200 rounded w-full" />
              <div className="h-4 bg-zinc-200 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 rounded w-4/6" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-zinc-200 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="h-96 bg-zinc-200 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}
