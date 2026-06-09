import { createClient } from '@/lib/supabase/server'
import { formatNaira } from '@/lib/utils'

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100)
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
              <div
                className="w-full rounded-t-lg bg-zinc-900 transition-all"
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 font-medium">{d.label}</p>
          </div>
        )
      })}
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const now = new Date()

  // Build 6-month windows
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    return {
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      start: d.toISOString(),
      end: end.toISOString(),
    }
  })

  const [
    { data: allPaidBookings },
    { data: topListingsData },
    { data: allItems },
    { count: totalUsers },
    { count: totalReferrals },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('total_amount, created_at')
      .eq('payment_status', 'paid'),
    supabase
      .from('booking_items')
      .select('listing_id, subtotal, bookings ( payment_status ), listings ( title, type )')
      .not('bookings', 'is', null),
    supabase
      .from('booking_items')
      .select('type, subtotal, bookings ( payment_status )'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('referrals').select('id', { count: 'exact', head: true }),
  ])

  // Revenue by month
  const revenueByMonth = months.map((m) => {
    const total = (allPaidBookings ?? [])
      .filter((b) => b.created_at >= m.start && b.created_at < m.end)
      .reduce((s, b) => s + (b.total_amount ?? 0), 0)
    return { label: m.label, value: total }
  })

  // Bookings by month
  const bookingsByMonth = months.map((m) => {
    const count = (allPaidBookings ?? []).filter(
      (b) => b.created_at >= m.start && b.created_at < m.end
    ).length
    return { label: m.label, value: count }
  })

  // Type split
  const paidItems = (allItems ?? []).filter(
    (i) => (i.bookings as unknown as { payment_status: string } | null)?.payment_status === 'paid'
  )
  const shortletRevenue = paidItems
    .filter((i) => i.type === 'shortlet')
    .reduce((s, i) => s + (i.subtotal ?? 0), 0)
  const carRevenue = paidItems
    .filter((i) => i.type === 'car')
    .reduce((s, i) => s + (i.subtotal ?? 0), 0)
  const totalRevenue = shortletRevenue + carRevenue

  // Top listings
  const listingMap = new Map<string, { title: string; type: string; revenue: number; bookings: number }>()
  for (const item of topListingsData ?? []) {
    const bk = item.bookings as unknown as { payment_status: string } | null
    if (bk?.payment_status !== 'paid') continue
    const listing = item.listings as unknown as { title: string; type: string } | null
    if (!listing || !item.listing_id) continue
    const existing = listingMap.get(item.listing_id) ?? { title: listing.title, type: listing.type, revenue: 0, bookings: 0 }
    existing.revenue += item.subtotal ?? 0
    existing.bookings += 1
    listingMap.set(item.listing_id, existing)
  }
  const topListings = Array.from(listingMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)

  const shortletPct = totalRevenue > 0 ? Math.round((shortletRevenue / totalRevenue) * 100) : 0
  const carPct = 100 - shortletPct

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Last 6 months</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">Total revenue</p>
          <p className="text-2xl font-bold text-zinc-900">{formatNaira(totalRevenue)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">from paid bookings</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">Platform commission</p>
          <p className="text-2xl font-bold text-zinc-900">{formatNaira(totalRevenue * 0.1)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">10% of revenue</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">Total users</p>
          <p className="text-2xl font-bold text-zinc-900">{totalUsers ?? 0}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{totalReferrals ?? 0} via referral</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">Paid bookings</p>
          <p className="text-2xl font-bold text-zinc-900">{allPaidBookings?.length ?? 0}</p>
          <p className="text-xs text-zinc-400 mt-0.5">confirmed payments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-6">Revenue by month</h2>
          <BarChart data={revenueByMonth} />
          <div className="mt-4 flex justify-between text-xs text-zinc-400">
            <span>{formatNaira(0)}</span>
            <span>{formatNaira(Math.max(...revenueByMonth.map((d) => d.value), 1))}</span>
          </div>
        </div>

        {/* Bookings chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-6">Bookings by month</h2>
          <BarChart data={bookingsByMonth} />
          <div className="mt-4 flex justify-between text-xs text-zinc-400">
            <span>0</span>
            <span>{Math.max(...bookingsByMonth.map((d) => d.value), 1)} bookings</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Type breakdown */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-5">Revenue by type</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-700 font-medium">Shortlets</span>
                <span className="text-zinc-500">{formatNaira(shortletRevenue)} · {shortletPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${shortletPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-700 font-medium">Car rentals</span>
                <span className="text-zinc-500">{formatNaira(carRevenue)} · {carPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${carPct}%` }}
                />
              </div>
            </div>
          </div>
          {totalRevenue === 0 && (
            <p className="text-sm text-zinc-400 text-center mt-6">No revenue data yet</p>
          )}
        </div>

        {/* Top listings */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Top listings by revenue</h2>
          </div>
          {topListings.length === 0 ? (
            <p className="px-6 py-8 text-sm text-zinc-400 text-center">No bookings yet</p>
          ) : (
            <div className="divide-y divide-zinc-50">
              {topListings.map(([id, listing], i) => (
                <div key={id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="text-sm font-bold text-zinc-300 w-5 text-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{listing.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                      {listing.type} · {listing.bookings} booking{listing.bookings !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 flex-shrink-0">{formatNaira(listing.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
