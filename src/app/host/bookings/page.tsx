import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate } from '@/lib/utils'

export default async function HostBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('host_id', user!.id)

  const listingIds = listings?.map((l) => l.id) ?? []

  const { data: items } = listingIds.length > 0
    ? await supabase
        .from('booking_items')
        .select(`
          id, type, check_in, check_out, nights_or_days, subtotal,
          bookings ( id, status, payment_status, total_amount, created_at, users ( full_name, email ) ),
          listings ( title, city )
        `)
        .in('listing_id', listingIds)
        .order('check_in', { ascending: false })
    : { data: [] }

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
    completed: 'bg-zinc-100 text-zinc-600',
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Bookings</h1>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {!items || items.length === 0 ? (
          <p className="px-6 py-12 text-sm text-zinc-400 text-center">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Guest', 'Listing', 'Dates', 'Nights/Days', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {items.map((item) => {
                  const bk = item.bookings as unknown as { id: string; status: string; payment_status: string; created_at: string; users: { full_name: string; email: string } | null } | null
                  const guest = bk?.users as unknown as { full_name: string; email: string } | null
                  const listing = item.listings as unknown as { title: string; city: string } | null

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900">{guest?.full_name ?? '—'}</p>
                        <p className="text-xs text-zinc-400">{guest?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-zinc-900 line-clamp-1 max-w-[140px]">{listing?.title ?? '—'}</p>
                        <p className="text-xs text-zinc-400">{listing?.city}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-zinc-600">
                        <p>{formatDate(item.check_in)}</p>
                        <p className="text-xs text-zinc-400">→ {formatDate(item.check_out)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {item.nights_or_days} {item.type === 'shortlet' ? 'nights' : 'days'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900 whitespace-nowrap">
                        {formatNaira(item.subtotal)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[bk?.status ?? ''] ?? ''}`}>
                          {bk?.status ?? '—'}
                        </span>
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
