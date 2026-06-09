import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatNaira } from '@/lib/utils'
import type { Listing } from '@/types'

export default async function HostListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  const items = (listings ?? []) as Listing[]

  const statusLabel = (l: Listing) => {
    if (!l.is_approved) return { text: 'Pending approval', style: 'bg-amber-50 text-amber-700' }
    if (l.is_active) return { text: 'Live', style: 'bg-emerald-50 text-emerald-700' }
    return { text: 'Inactive', style: 'bg-zinc-100 text-zinc-500' }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">My Listings</h1>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New listing
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-900 mb-1">No listings yet</p>
          <p className="text-sm text-zinc-400 mb-6">Submit a shortlet or car for review</p>
          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            Add your first listing
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {items.map((listing) => {
              const status = statusLabel(listing)
              const price = listing.type === 'shortlet'
                ? `${formatNaira(listing.price_per_night ?? 0)}/night`
                : `${formatNaira(listing.price_per_day ?? 0)}/day`

              return (
                <div key={listing.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                    {listing.images?.[0] && (
                      <Image src={listing.images[0]} alt={listing.title} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{listing.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{listing.city} · {price}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.style}`}>
                      {status.text}
                    </span>
                    <Link
                      href={`/host/availability/${listing.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
                    >
                      Calendar
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-zinc-400 text-center mt-4">
          New listings require admin approval before going live
        </p>
      )}
    </div>
  )
}
