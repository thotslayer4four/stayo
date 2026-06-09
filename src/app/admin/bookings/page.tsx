import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate } from '@/lib/utils'
import CompleteBookingsButton from './CompleteBookingsButton'

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, payment_status, total_amount, discount_amount, created_at,
      users ( full_name, email ),
      booking_items (
        type, check_in, check_out, nights_or_days,
        listings ( title, city )
      )
    `)
    .order('created_at', { ascending: false })

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
    completed: 'bg-zinc-100 text-zinc-600',
  }

  const paymentStyles: Record<string, string> = {
    paid: 'text-emerald-700',
    pending: 'text-amber-600',
    failed: 'text-red-600',
    refunded: 'text-zinc-500',
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Bookings</h1>

      <CompleteBookingsButton />

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {!bookings || bookings.length === 0 ? (
          <p className="px-6 py-12 text-sm text-zinc-400 text-center">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Guest', 'Listing', 'Dates', 'Amount', 'Status', 'Payment', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {bookings.map((b) => {
                  const guest = b.users as unknown as { full_name: string; email: string } | null
                  const items = b.booking_items as unknown as Array<{
                    type: string; check_in: string; check_out: string; nights_or_days: number
                    listings: { title: string; city: string } | null
                  }>
                  const firstItem = items?.[0]
                  const listing = firstItem?.listings

                  return (
                    <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900 whitespace-nowrap">{guest?.full_name ?? '—'}</p>
                        <p className="text-xs text-zinc-400">{guest?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-zinc-900 line-clamp-1 max-w-[160px]">{listing?.title ?? '—'}</p>
                        <p className="text-xs text-zinc-400">{listing?.city}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-zinc-600">
                        {firstItem ? (
                          <>
                            <p>{formatDate(firstItem.check_in)}</p>
                            <p className="text-xs text-zinc-400">
                              {firstItem.nights_or_days} {firstItem.type === 'shortlet' ? 'nights' : 'days'}
                            </p>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900 whitespace-nowrap">
                        {formatNaira(b.total_amount)}
                        {b.discount_amount > 0 && (
                          <p className="text-xs text-emerald-600 font-normal">−{formatNaira(b.discount_amount)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[b.status] ?? ''}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-xs font-semibold capitalize ${paymentStyles[b.payment_status] ?? ''}`}>
                        {b.payment_status}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(b.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
