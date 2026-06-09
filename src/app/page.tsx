import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import Navbar from '@/components/Navbar'
import CategoryBar from '@/components/CategoryBar'
import ListingGrid from '@/components/ListingGrid'
import AIRecommendations from '@/components/AIRecommendations'
import BottomNav from '@/components/BottomNav'
import type { Listing } from '@/types'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    type?: string
    q?: string
    min_price?: string
    max_price?: string
    check_in?: string
    check_out?: string
    guests?: string
    sort?: string
    page?: string
  }>
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const publicSupabase = createPublicClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('users').select('full_name, avatar_url, role').eq('id', user.id).single()
    : { data: null }

  const page = Math.max(1, Number(params.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  let query = publicSupabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .eq('is_approved', true)

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type)
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,city.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.min_price) {
    const min = Number(params.min_price)
    if (!isNaN(min)) {
      query = query.or(`price_per_night.gte.${min},price_per_day.gte.${min}`)
    }
  }

  if (params.max_price) {
    const max = Number(params.max_price)
    if (!isNaN(max)) {
      query = query.or(`price_per_night.lte.${max},price_per_day.lte.${max}`)
    }
  }

  if (params.guests) {
    const g = Number(params.guests)
    if (!isNaN(g) && g > 1) {
      query = query.or(`max_guests.gte.${g},type.eq.car`)
    }
  }

  // Sort
  const sort = params.sort ?? 'newest'
  if (sort === 'price_asc') {
    const col = params.type === 'car' ? 'price_per_day' : 'price_per_night'
    query = query.order(col, { ascending: true, nullsFirst: false })
  } else if (sort === 'price_desc') {
    const col = params.type === 'car' ? 'price_per_day' : 'price_per_night'
    query = query.order(col, { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: listings, count: totalCount } = await query.range(offset, offset + PAGE_SIZE - 1)

  let filteredListings = (listings ?? []) as Listing[]

  if (params.check_in && params.check_out) {
    const { data: blocked } = await publicSupabase
      .from('availability')
      .select('listing_id')
      .gte('date', params.check_in)
      .lt('date', params.check_out)

    if (blocked && blocked.length > 0) {
      const blockedIds = new Set(blocked.map((b) => b.listing_id))
      filteredListings = filteredListings.filter((l) => !blockedIds.has(l.id))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        profile={profile}
        searchQuery={params.q}
        checkIn={params.check_in}
        checkOut={params.check_out}
        guests={params.guests}
      />

      {/* pt-20 clears the fixed navbar */}
      <div className="pt-20">
        <CategoryBar
          activeType={params.type ?? 'all'}
          q={params.q ?? ''}
          checkIn={params.check_in ?? ''}
          checkOut={params.check_out ?? ''}
          guests={params.guests ?? ''}
          minPrice={params.min_price ?? ''}
          maxPrice={params.max_price ?? ''}
          sort={sort}
        />

        {/* pb-24 on mobile gives room for the fixed bottom nav */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
          {process.env.ANTHROPIC_API_KEY && <AIRecommendations />}

          {filteredListings.length > 0 && (
            <p className="hidden md:block text-sm text-zinc-500 mb-6">
              {totalCount != null && totalCount > PAGE_SIZE
                ? `Showing ${offset + 1}–${Math.min(offset + filteredListings.length, totalCount)} of ${totalCount} listings`
                : `${filteredListings.length} ${filteredListings.length === 1 ? 'listing' : 'listings'} in Abuja`}
            </p>
          )}

          <ListingGrid listings={filteredListings} />

          {/* Pagination */}
          {(totalCount != null && totalCount > PAGE_SIZE) && (() => {
            const totalPages = Math.ceil(totalCount / PAGE_SIZE)
            const buildPageUrl = (p: number) => {
              const sp = new URLSearchParams()
              if (params.type && params.type !== 'all') sp.set('type', params.type)
              if (params.q) sp.set('q', params.q)
              if (params.min_price) sp.set('min_price', params.min_price)
              if (params.max_price) sp.set('max_price', params.max_price)
              if (params.check_in) sp.set('check_in', params.check_in)
              if (params.check_out) sp.set('check_out', params.check_out)
              if (params.guests && params.guests !== '1') sp.set('guests', params.guests)
              if (sort !== 'newest') sp.set('sort', sort)
              if (p > 1) sp.set('page', String(p))
              return `/?${sp.toString()}`
            }
            return (
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <a
                    href={buildPageUrl(page - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </a>
                )}
                <span className="px-4 py-2.5 text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <a
                    href={buildPageUrl(page + 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            )
          })()}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
