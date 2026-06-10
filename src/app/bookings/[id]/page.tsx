import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import CancelBookingButton from '@/components/CancelBookingButton'
import { formatNaira, formatDate, formatDateTime } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('full_name, avatar_url, role').eq('id', user!.id).single()
    : { data: null }

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, status, payment_status, total_amount, commission_amount,
      discount_amount, paystack_reference, created_at,
      booking_items (
        id, type, check_in, check_out, nights_or_days, price_per_unit, subtotal,
        listings ( id, title, city, address, images, type, car_make, car_model, car_year )
      )
    `)
    .eq('id', id)
    .eq('guest_id', user!.id)
    .single()

  if (!booking) notFound()

  const statusConfig: Record<string, { label: string; style: string }> = {
    confirmed: { label: 'Confirmed', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    pending: { label: 'Payment pending', style: 'bg-amber-50 text-amber-700 border-amber-100' },
    cancelled: { label: 'Cancelled', style: 'bg-red-50 text-red-600 border-red-100' },
    completed: { label: 'Completed', style: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  }
  const statusInfo = statusConfig[booking.status] ?? statusConfig.pending

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-28 md:pb-16">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          My Bookings
        </Link>

        {/* Status banner */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${statusInfo.style}`}>
          {booking.status === 'confirmed' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {booking.status === 'pending' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{statusInfo.label}</span>
        </div>

        {/* Booking items */}
        <div className="space-y-4 mb-6">
          {booking.booking_items?.map((item) => {
            const listing = item.listings as unknown as {
              id: string; title: string; city: string; address: string
              images: string[]; type: string; car_make?: string; car_model?: string; car_year?: number
            } | null

            return (
              <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                    {listing?.images?.[0] && (
                      <Image src={listing.images[0]} alt={listing.title} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full">
                      {item.type === 'shortlet' ? 'Shortlet' : 'Car'}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 mt-1.5 line-clamp-1">
                      {listing?.title}
                    </p>
                    <p className="text-xs text-zinc-500">{listing?.city}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-1">
                      {item.type === 'shortlet' ? 'Check-in' : 'Pick-up'}
                    </p>
                    <p className="font-semibold text-zinc-900 text-xs leading-snug">
                      {item.check_in?.includes('T') ? formatDateTime(item.check_in) : formatDate(item.check_in)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-1">
                      {item.type === 'shortlet' ? 'Check-out' : 'Return'}
                    </p>
                    <p className="font-semibold text-zinc-900 text-xs leading-snug">
                      {item.check_out?.includes('T') ? formatDateTime(item.check_out) : formatDate(item.check_out)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-zinc-500">
                    {formatNaira(item.price_per_unit)} × {item.nights_or_days}{' '}
                    {item.check_in?.includes('T')
                      ? item.nights_or_days === 1
                        ? 'hour'
                        : 'hours'
                      : item.type === 'shortlet'
                      ? 'nights'
                      : 'days'}
                  </span>
                  <span className="font-semibold text-zinc-900">{formatNaira(item.subtotal)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Payment summary</h2>
          <div className="space-y-2 text-sm">
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promo discount</span>
                <span>−{formatNaira(booking.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-zinc-900 text-base pt-2 border-t border-zinc-100">
              <span>Total paid</span>
              <span>{formatNaira(booking.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>Payment status</span>
              <span className="capitalize">{booking.payment_status}</span>
            </div>
            {booking.paystack_reference && (
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Reference</span>
                <span className="font-mono">{booking.paystack_reference}</span>
              </div>
            )}
          </div>
        </div>

        {booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
          <div className="mt-6">
            <CancelBookingButton bookingId={booking.id} />
          </div>
        )}

        <p className="text-xs text-zinc-400 text-center mt-6">
          Booked on {formatDate(booking.created_at)} · Booking ID: {booking.id.slice(0, 8).toUpperCase()}
        </p>
      </main>
      <BottomNav />
    </div>
  )
}
