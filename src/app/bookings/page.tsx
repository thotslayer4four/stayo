import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import { formatNaira, formatDate, formatDateTime } from '@/lib/utils'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('full_name, avatar_url, role').eq('id', user!.id).single()
    : { data: null }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, payment_status, total_amount, discount_amount, created_at,
      booking_items (
        id, type, check_in, check_out, nights_or_days,
        listings ( id, title, city, images, type )
      )
    `)
    .eq('guest_id', user!.id)
    .order('created_at', { ascending: false })

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
    completed: 'bg-zinc-100 text-zinc-600',
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-28 md:pb-16">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">My Bookings</h1>

        {!bookings || bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">No bookings yet</h3>
            <p className="text-sm text-zinc-500 mb-6">When you book a shortlet or car, it will appear here.</p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const firstItem = booking.booking_items?.[0]
              const listing = firstItem?.listings as unknown as { id: string; title: string; city: string; images: string[]; type: string } | null
              const image = listing?.images?.[0]

              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                      {image && (
                        <Image src={image} alt={listing?.title ?? ''} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                          {listing?.title ?? 'Booking'}
                        </p>
                        <span
                          className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                            statusStyles[booking.status] ?? 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{listing?.city}</p>
                      {firstItem && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {firstItem.check_in?.includes('T')
                            ? formatDateTime(firstItem.check_in)
                            : formatDate(firstItem.check_in)}{' '}
                          →{' '}
                          {firstItem.check_out?.includes('T')
                            ? formatDateTime(firstItem.check_out)
                            : formatDate(firstItem.check_out)}{' '}
                          · {firstItem.nights_or_days}{' '}
                          {firstItem.check_in?.includes('T')
                            ? firstItem.nights_or_days === 1
                              ? 'hour'
                              : 'hours'
                            : firstItem.type === 'shortlet'
                            ? 'nights'
                            : 'days'}
                        </p>
                      )}
                      <p className="text-sm font-bold text-zinc-900 mt-2">
                        {formatNaira(booking.total_amount)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
