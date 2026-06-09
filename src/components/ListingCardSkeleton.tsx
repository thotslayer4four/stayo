export default function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-zinc-200 mb-3" />
      <div className="px-0.5 space-y-2">
        <div className="h-4 bg-zinc-200 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-200 rounded-lg w-1/2" />
        <div className="h-3 bg-zinc-200 rounded-lg w-1/3 mt-1" />
      </div>
    </div>
  )
}
