import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatNaira, formatDate } from '@/lib/utils'

export default async function HostDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const todayStr = now.toISOString().split('T')[0]

  // Host's listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, type, is_active')
    .eq('host_id', user!.id)

  const listingIds = listings?.map((l) => l.id) ?? []

  // Bookings for host's listings
  const { data: bookings } = listingIds.length > 0
    ? await supabase
        .from('booking_items')
        .select(`
          id, type, check_in, check_out, subtotal, nights_or_days,
          bookings ( id, status, payment_status, total_amount, created_at, users ( full_name ) ),
          listings ( title, city )
        `)
        .in('listing_id', listingIds)
        .order('check_in', { ascending: true })
    : { data: [] }

  // Revenue this month
  const monthBookings = bookings?.filter((b) => {
    const bk = b.bookings as unknown as { payment_status: string; created_at: string } | null
    return bk?.payment_status === 'paid' && bk.created_at >= monthStart
  }) ?? []
  const monthRevenue = monthBookings.reduce((s, b) => s + b.subtotal, 0)

  // Upcoming bookings (next 30 days)
  const upcoming = bookings?.filter((b) => {
    const bk = b.bookings as unknown as { status: string } | null
    return bk?.status === 'confirmed' && b.check_in >= todayStr
  }).slice(0, 5) ?? []

  const totalRevenue = bookings?.reduce((s, b) => {
    const bk = b.bookings as unknown as { payment_status: string } | null
    return bk?.payment_status === 'paid' ? s + b.subtotal : s
  }, 0) ?? 0

  const stats = [
    { label: 'Listings', value: listings?.length ?? 0, sub: `${listings?.filter((l) => l.is_active).length ?? 0} active` },
    { label: 'Revenue this month', value: formatNaira(monthRevenue), sub: `${monthBookings.length} bookings` },
    { label: 'Total revenue', value: formatNaira(totalRevenue), sub: 'all time' },
    { label: 'Upcoming stays', value: upcoming.length, sub: 'next 30 days' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Host Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Upcoming bookings</h2>
            <Link href="/host/bookings" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {upcoming.length === 0 ? (
              <p className="px-6 py-8 text-sm text-zinc-400 text-center">No upcoming bookings</p>
            ) : (
              upcoming.map((item) => {
                const bk = item.bookings as unknown as { id: string; users: { full_name: string } | null } | null
                const guest = bk?.users as unknown as { full_name: string } | null
                const listing = item.listings as unknown as { title: string; city: string } | null

                return (
                  <div key={item.id} className="px-6 py-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{guest?.full_name ?? 'Guest'}</p>
                        <p className="text-xs text-zinc-500">{listing?.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-600">{formatDate(item.check_in)}</p>
                        <p className="text-xs text-zinc-400">{item.nights_or_days} {item.type === 'shortlet' ? 'nights' : 'days'}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Your listings */}
        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Your listings</h2>
            <Link href="/host/availability" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {!listings || listings.length === 0 ? (
              <p className="px-6 py-8 text-sm text-zinc-400 text-center">No listings yet</p>
            ) : (
              listings.map((l) => (
                <div key={l.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 line-clamp-1">{l.title}</p>
                    <span className="text-xs text-zinc-400 capitalize">{l.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      l.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {l.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Link
                      href={`/host/availability?listing=${l.id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      Calendar →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
