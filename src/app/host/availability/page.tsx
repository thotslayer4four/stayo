import { createClient } from '@/lib/supabase/server'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ listing?: string }>
}

export default async function HostAvailabilityPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, type, city, is_active')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  if (!listings || listings.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Availability</h1>
        <p className="text-sm text-zinc-500 mb-8">Block or unblock dates for your listings</p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-sm text-zinc-400 mb-4">No listings yet</p>
          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            Add your first listing
          </Link>
        </div>
      </div>
    )
  }

  const selectedId = params.listing && listings.some(l => l.id === params.listing)
    ? params.listing
    : listings[0].id

  const selectedListing = listings.find(l => l.id === selectedId)!

  const today = new Date()
  const threeMonthsOut = new Date(today.getFullYear(), today.getMonth() + 3, 0)

  const { data: availability } = await supabase
    .from('availability')
    .select('date, reason, booking_id')
    .eq('listing_id', selectedListing.id)
    .gte('date', today.toISOString().split('T')[0])
    .lte('date', threeMonthsOut.toISOString().split('T')[0])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Availability</h1>
        <p className="text-sm text-zinc-500">Block or unblock dates for your listings</p>
      </div>

      {/* Listing tabs — only shown when there are multiple listings */}
      {listings.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/host/availability?listing=${l.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                l.id === selectedId
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {l.title}
            </Link>
          ))}
        </div>
      )}

      {/* Selected listing info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-zinc-900">{selectedListing.title}</span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500">{selectedListing.city}</span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500 capitalize">{selectedListing.type}</span>
          <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            selectedListing.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
          }`}>
            {selectedListing.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-zinc-300 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200 inline-block" />
          Blocked by you
        </span>
      </div>

      <AvailabilityCalendar
        listingId={selectedListing.id}
        availability={(availability ?? []).map((a) => ({
          date: a.date,
          reason: a.reason as 'booked' | 'manual',
          bookingId: a.booking_id,
        }))}
      />
    </div>
  )
}
