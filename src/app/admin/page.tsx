import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatNaira } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalListings },
    { count: activeListings },
    { count: pendingListings },
    { count: totalBookings },
    { count: monthBookings },
    { data: revenueData },
    { data: pendingPayouts },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('is_approved', true),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('bookings').select('total_amount').eq('payment_status', 'paid').gte('created_at', monthStart),
    supabase.from('payouts').select('amount').eq('status', 'pending'),
    supabase
      .from('bookings')
      .select(`
        id, status, payment_status, total_amount, created_at,
        users ( full_name ),
        booking_items ( listings ( title ) )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const monthRevenue = revenueData?.reduce((sum, b) => sum + b.total_amount, 0) ?? 0
  const pendingPayoutTotal = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) ?? 0

  const stats = [
    { label: 'Bookings this month', value: monthBookings ?? 0, sub: `${totalBookings ?? 0} total` },
    { label: 'Revenue this month', value: formatNaira(monthRevenue), sub: 'confirmed payments' },
    { label: 'Active listings', value: activeListings ?? 0, sub: pendingListings ? `${pendingListings} pending approval` : 'all approved' },
    { label: 'Pending payouts', value: formatNaira(pendingPayoutTotal), sub: `to hosts` },
  ]

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
    completed: 'bg-zinc-100 text-zinc-600',
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Pending listings alert */}
      {(pendingListings ?? 0) > 0 && (
        <Link
          href="/admin/listings"
          className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 hover:bg-amber-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {pendingListings} listing{pendingListings !== 1 ? 's' : ''} pending approval
            </p>
            <p className="text-xs text-amber-700">Review and approve new submissions</p>
          </div>
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New listing
        </Link>
        <Link
          href="/admin/promo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors"
        >
          New promo code
        </Link>
        <Link
          href="/admin/payouts"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors"
        >
          Manage payouts
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Recent bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-zinc-100">
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="px-6 py-8 text-sm text-zinc-400 text-center">No bookings yet</p>
          ) : (
            recentBookings.map((b) => {
              const guest = b.users as unknown as { full_name: string } | null
              const item = (b.booking_items as unknown as Array<{ listings: { title: string } | null }>)?.[0]
              const listingTitle = (item?.listings as unknown as { title: string } | null)?.title

              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{listingTitle ?? 'Booking'}</p>
                    <p className="text-xs text-zinc-500">{guest?.full_name ?? 'Guest'}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyles[b.status] ?? ''}`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">{formatNaira(b.total_amount)}</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
