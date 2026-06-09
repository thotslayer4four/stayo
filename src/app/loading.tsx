import ListingCardSkeleton from '@/components/ListingCardSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar placeholder */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-zinc-100" />

      <div className="pt-20">
        {/* CategoryBar placeholder */}
        <div className="sticky top-20 z-30 bg-white border-b border-zinc-100 h-[57px]" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Count placeholder */}
          <div className="h-4 w-40 bg-zinc-200 rounded-lg animate-pulse mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
