import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate } from '@/lib/utils'

export default async function HostEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), start: d.toISOString(), end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString() }
  })

  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('host_id', user!.id)

  const listingIds = listings?.map((l) => l.id) ?? []

  const { data: items } = listingIds.length > 0
    ? await supabase
        .from('booking_items')
        .select(`
          id, subtotal, check_in, check_out, type, nights_or_days,
          bookings ( id, payment_status, payout_amount, created_at ),
          listings ( title )
        `)
        .in('listing_id', listingIds)
        .order('check_in', { ascending: false })
    : { data: [] }

  const paidItems = items?.filter((i) => {
    const bk = i.bookings as unknown as { payment_status: string } | null
    return bk?.payment_status === 'paid'
  }) ?? []

  const totalEarned = paidItems.reduce((s, i) => {
    const bk = i.bookings as unknown as { payout_amount: number } | null
    return s + (bk?.payout_amount ?? i.subtotal * 0.9)
  }, 0)

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthItems = paidItems.filter((i) => {
    const bk = i.bookings as unknown as { created_at: string } | null
    return (bk?.created_at ?? '') >= thisMonthStart
  })
  const thisMonthEarned = thisMonthItems.reduce((s, i) => s + i.subtotal * 0.9, 0)

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Earnings</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">This month</p>
          <p className="text-2xl font-bold text-zinc-900">{formatNaira(thisMonthEarned)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{thisMonthItems.length} bookings</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500 mb-1">All time</p>
          <p className="text-2xl font-bold text-zinc-900">{formatNaira(totalEarned)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{paidItems.length} bookings</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-zinc-500 mb-1">Platform commission</p>
          <p className="text-2xl font-bold text-zinc-900">10%</p>
          <p className="text-xs text-zinc-400 mt-0.5">You keep 90% of each booking</p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Transaction history</h2>
        </div>
        {paidItems.length === 0 ? (
          <p className="px-6 py-12 text-sm text-zinc-400 text-center">No earnings yet</p>
        ) : (
          <div className="divide-y divide-zinc-50">
            {paidItems.map((item) => {
              const bk = item.bookings as unknown as { id: string; payout_amount: number; created_at: string } | null
              const listing = item.listings as unknown as { title: string } | null
              const earned = bk?.payout_amount ?? item.subtotal * 0.9

              return (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 line-clamp-1">{listing?.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatDate(item.check_in)} – {formatDate(item.check_out)} · {item.nights_or_days} {item.type === 'shortlet' ? 'nights' : 'days'}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-700">+{formatNaira(earned)}</p>
                    <p className="text-xs text-zinc-400">{bk?.created_at ? formatDate(bk.created_at) : ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
