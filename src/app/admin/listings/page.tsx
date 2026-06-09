import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatNaira } from '@/lib/utils'
import AdminListingActions from './AdminListingActions'

export default async function AdminListingsPage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, type, title, city, price_per_night, price_per_day,
      is_active, is_approved, created_at,
      users ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New listing
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {!listings || listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">No listings yet</p>
            <Link
              href="/admin/listings/new"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              Create first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Listing</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Host</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {listings.map((l) => {
                  const host = l.users as unknown as { full_name: string } | null
                  const price = l.type === 'shortlet' ? l.price_per_night : l.price_per_day
                  const priceUnit = l.type === 'shortlet' ? '/night' : '/day'

                  return (
                    <tr key={l.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900 line-clamp-1">{l.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{l.city}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full capitalize">
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-600">{host?.full_name ?? '—'}</td>
                      <td className="px-4 py-4 font-medium text-zinc-900">
                        {price != null ? `${formatNaira(price)}${priceUnit}` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                            l.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {l.is_approved ? 'Approved' : 'Pending'}
                          </span>
                          {!l.is_active && (
                            <span className="text-xs font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full w-fit">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <AdminListingActions
                          id={l.id}
                          isApproved={l.is_approved}
                          isActive={l.is_active}
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
    </div>
  )
}
