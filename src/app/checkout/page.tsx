import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import CheckoutForm from '@/components/CheckoutForm'
import { formatNaira, calcNights, calcHours, formatDate, formatDateTime } from '@/lib/utils'
import type { Listing, DbUser } from '@/types'

interface PageProps {
  searchParams: Promise<{
    listing?: string
    check_in?: string
    check_out?: string
    guests?: string
    unit?: string
  }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams

  if (!params.listing || !params.check_in || !params.check_out) {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const publicSupabase = createPublicClient()

  const [profileResult, listingResult, carsResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    publicSupabase.from('listings').select('*').eq('id', params.listing).eq('is_active', true).single(),
    publicSupabase
      .from('listings')
      .select('*')
      .eq('type', 'car')
      .eq('is_active', true)
      .order('price_per_day', { ascending: true }),
  ])

  if (!listingResult.data) notFound()

  const listing = listingResult.data as Listing
  const profile = profileResult.data as DbUser
  const availableCars = (carsResult.data ?? []) as Listing[]

  const isHourly = params.unit === 'hours'
  const duration = isHourly
    ? calcHours(params.check_in, params.check_out)
    : calcNights(params.check_in, params.check_out)

  const pricePerUnit = isHourly
    ? (listing.price_per_hour ?? Math.round((listing.price_per_day ?? 0) / 24))
    : listing.type === 'shortlet'
    ? listing.price_per_night
    : listing.price_per_day

  const subtotal = (pricePerUnit ?? 0) * duration
  const guests = Number(params.guests ?? 1)

  const unitLabel = isHourly ? 'hour' : listing.type === 'shortlet' ? 'night' : 'day'
  const unitLabelPlural = isHourly ? 'hours' : listing.type === 'shortlet' ? 'nights' : 'days'

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar profile={profile} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          href={`/listings/${listing.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listing
        </Link>

        <h1 className="text-2xl font-bold text-zinc-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
          {/* Left: form */}
          <CheckoutForm
            listing={listing}
            profile={profile}
            checkIn={params.check_in}
            checkOut={params.check_out}
            guests={guests}
            duration={duration}
            unit={params.unit ?? 'days'}
            subtotal={subtotal}
            availableCars={availableCars}
          />

          {/* Right: order summary */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-zinc-900 mb-4">Order summary</h2>

              {/* Listing */}
              <div className="flex gap-3 pb-4 mb-4 border-b border-zinc-100">
                <div className="relative w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                  {listing.images?.[0] && (
                    <Image src={listing.images[0]} alt={listing.title} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
                    {listing.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{listing.city}</p>
                  <span className="inline-block mt-1 text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                    {listing.type === 'shortlet' ? 'Shortlet' : 'Car'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm pb-4 mb-4 border-b border-zinc-100">
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {listing.type === 'shortlet' ? 'Check-in' : isHourly ? 'Pick-up' : 'Pick-up'}
                  </span>
                  <span className="font-medium text-zinc-900 text-right">
                    {isHourly ? formatDateTime(params.check_in) : formatDate(params.check_in)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {listing.type === 'shortlet' ? 'Check-out' : 'Return'}
                  </span>
                  <span className="font-medium text-zinc-900 text-right">
                    {isHourly ? formatDateTime(params.check_out) : formatDate(params.check_out)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration</span>
                  <span className="font-medium text-zinc-900">
                    {duration} {duration === 1 ? unitLabel : unitLabelPlural}
                  </span>
                </div>
                {listing.type === 'shortlet' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Guests</span>
                    <span className="font-medium text-zinc-900">{guests}</span>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-500">
                  {pricePerUnit != null ? formatNaira(pricePerUnit) : '—'} × {duration}{' '}
                  {duration === 1 ? unitLabel : unitLabelPlural}
                </span>
                <span className="text-zinc-900 font-medium">{formatNaira(subtotal)}</span>
              </div>

              <p className="text-xs text-zinc-400 text-center mt-3">
                {listing.type === 'shortlet' ? 'Car bundle price will appear if selected' : 'Promo discounts apply at checkout'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
