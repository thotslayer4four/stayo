import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate } from '@/lib/utils'
import PayoutActions from './PayoutActions'

export default async function AdminPayoutsPage() {
  const supabase = await createClient()

  // Confirmed + paid bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, payout_amount, created_at,
      users ( id, full_name, phone ),
      booking_items (
        type, check_in, check_out,
        listings ( title, city )
      )
    `)
    .eq('status', 'confirmed')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })

  // All payouts
  const { data: payouts } = await supabase
    .from('payouts')
    .select('id, booking_id, amount, status, paid_at, payment_method')
    .order('created_at', { ascending: false })

  const paidBookingIds = new Set(
    payouts?.filter((p) => p.status === 'paid').map((p) => p.booking_id) ?? []
  )
  const pendingPayoutMap = new Map(
    payouts?.filter((p) => p.status === 'pending').map((p) => [p.booking_id, p]) ?? []
  )

  const unpaid = bookings?.filter((b) => !paidBookingIds.has(b.id)) ?? []
  const paid = payouts?.filter((p) => p.status === 'paid') ?? []

  const totalPending = unpaid.reduce((s, b) => s + b.payout_amount, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Payouts</h1>
          {totalPending > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-1">
              {formatNaira(totalPending)} pending to hosts
            </p>
          )}
        </div>
      </div>

      {/* Pending payouts */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Pending</h2>
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden mb-8">
        {unpaid.length === 0 ? (
          <p className="px-6 py-10 text-sm text-zinc-400 text-center">All payouts are up to date</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Host', 'Listing', 'Booking date', 'Payout amount', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {unpaid.map((b) => {
                  const host = b.users as unknown as { id: string; full_name: string; phone: string | null } | null
                  const items = b.booking_items as unknown as Array<{
                    type: string; check_in: string; check_out: string
                    listings: { title: string; city: string } | null
                  }>
                  const item = items?.[0]
                  const listing = item?.listings
                  const pendingPayout = pendingPayoutMap.get(b.id)

                  return (
                    <tr key={b.id} className="hover:bg-zinc-50/50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{host?.full_name ?? '—'}</p>
                        {host?.phone && <p className="text-xs text-zinc-400">{host.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-zinc-900 line-clamp-1 max-w-[160px]">{listing?.title ?? '—'}</p>
                        {item && (
                          <p className="text-xs text-zinc-400">
                            {formatDate(item.check_in)} – {formatDate(item.check_out)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-600 whitespace-nowrap">{formatDate(b.created_at)}</td>
                      <td className="px-5 py-4 font-bold text-zinc-900 whitespace-nowrap">{formatNaira(b.payout_amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          pendingPayout ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {pendingPayout ? 'Processing' : 'Not created'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <PayoutActions
                          bookingId={b.id}
                          hostId={host?.id ?? ''}
                          amount={b.payout_amount}
                          payoutId={pendingPayout?.id ?? null}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed payouts */}
      {paid.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Completed</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Amount', 'Method', 'Paid at'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {paid.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">{formatNaira(p.amount)}</td>
                      <td className="px-5 py-3.5 text-zinc-600 capitalize">{p.payment_method ?? 'Bank transfer'}</td>
                      <td className="px-5 py-3.5 text-zinc-500">{p.paid_at ? formatDate(p.paid_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
