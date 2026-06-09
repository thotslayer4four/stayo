import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ImageGallery from '@/components/ImageGallery'
import BookingPanel from '@/components/BookingPanel'
import ListingCard from '@/components/ListingCard'
import ShareButton from '@/components/ShareButton'
import BottomNav from '@/components/BottomNav'
import { formatNaira, formatDate } from '@/lib/utils'
import type { Listing } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const publicSupabase = createPublicClient()
  const { data } = await publicSupabase
    .from('listings')
    .select('title, description, city, images, type')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Listing — Stayo' }

  const typeLabel = data.type === 'shortlet' ? 'Shortlet' : 'Car Rental'
  const title = `${data.title} — ${typeLabel} in ${data.city} | Stayo`
  const description = data.description
    ? data.description.slice(0, 160)
    : `Book ${data.title}, a premium ${typeLabel.toLowerCase()} in ${data.city}, Abuja.`
  const image = data.images?.[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image && { images: [{ url: image, width: 1200, height: 800, alt: data.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const publicSupabase = createPublicClient()

  const [authResult, listingResult] = await Promise.all([
    supabase.auth.getUser(),
    publicSupabase.from('listings').select('*').eq('id', id).eq('is_active', true).single(),
  ])

  if (!listingResult.data) notFound()

  const l = listingResult.data as Listing

  const [profileResult, similarResult] = await Promise.all([
    authResult.data.user
      ? supabase.from('users').select('full_name, avatar_url, role').eq('id', authResult.data.user.id).single()
      : Promise.resolve({ data: null }),
    publicSupabase
      .from('listings')
      .select('*')
      .eq('type', l.type)
      .eq('is_active', true)
      .eq('is_approved', true)
      .neq('id', l.id)
      .limit(4),
  ])

  const profile = profileResult.data
  const similarListings = (similarResult.data ?? []) as Listing[]
  const isShortlet = l.type === 'shortlet'
  const isCar = l.type === 'car'
  const price = isShortlet ? l.price_per_night : l.price_per_day
  const priceUnit = isShortlet ? '/night' : '/day'
  const hourlyRate = isCar
    ? (l.price_per_hour ?? (l.price_per_day ? Math.round(l.price_per_day / 24) : null))
    : null

  return (
    <div className="min-h-screen bg-white">
      <Navbar profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-36 md:pb-32 lg:pb-16">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Browse
        </Link>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-brand-light text-brand px-2.5 py-1 rounded-full uppercase tracking-wide">
                {isShortlet ? 'Shortlet' : 'Car'}
              </span>
              <span className="text-sm text-zinc-500">{l.city}</span>
            </div>
            <ShareButton
              title={l.title}
              url={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/listings/${l.id}`}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 leading-tight">{l.title}</h1>
        </div>

        {/* Gallery */}
        <ImageGallery images={l.images ?? []} title={l.title} />

        {/* Content + booking panel */}
        <div className="mt-10 lg:grid lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* Left */}
          <div className="space-y-10">
            {l.description && (
              <section>
                <h2 className="text-xl font-bold text-zinc-900 mb-4">
                  About this {isShortlet ? 'property' : 'car'}
                </h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-[15px]">{l.description}</p>
              </section>
            )}

            {isShortlet && l.amenities?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-zinc-900 mb-5">What&apos;s included</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {l.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 text-sm text-zinc-700">
                      <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isShortlet && (l.max_guests || l.bedrooms || l.bathrooms) && (
              <div className="grid grid-cols-3 gap-3">
                {l.max_guests && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
                    <p className="text-xl font-bold text-zinc-900">{l.max_guests}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">guests</p>
                  </div>
                )}
                {l.bedrooms && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
                    <p className="text-xl font-bold text-zinc-900">{l.bedrooms}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{l.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</p>
                  </div>
                )}
                {l.bathrooms && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
                    <p className="text-xl font-bold text-zinc-900">{l.bathrooms}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{l.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</p>
                  </div>
                )}
              </div>
            )}

            {!isShortlet && (
              <section>
                <h2 className="text-xl font-bold text-zinc-900 mb-5">Car details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Make', value: l.car_make },
                    { label: 'Model', value: l.car_model },
                    { label: 'Year', value: l.car_year?.toString() },
                    { label: 'Seats', value: l.car_seats?.toString() },
                    { label: 'Transmission', value: l.car_transmission ? l.car_transmission.charAt(0).toUpperCase() + l.car_transmission.slice(1) : null },
                    { label: 'City', value: l.city },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                        <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-zinc-900">{item.value}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Location */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <p className="text-xs text-zinc-500 mb-1">Location</p>
              <p className="text-sm font-medium text-zinc-900">
                {l.address}, {l.city}, Abuja
              </p>
            </div>
          </div>

          {/* Right: booking panel (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel listing={l} />
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similarListings.length > 0 && (
          <section className="mt-16 pt-12 border-t border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              More {isShortlet ? 'shortlets' : 'cars'} in {l.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {similarListings.map((s) => (
                <ListingCard key={s.id} listing={s} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-zinc-100 px-4 py-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-zinc-900">
                {price != null ? formatNaira(price) : '—'}
              </span>
              <span className="text-sm text-zinc-500">{priceUnit}</span>
            </div>
            {hourlyRate != null && (
              <span className="text-xs text-zinc-400">{formatNaira(hourlyRate)}/hr</span>
            )}
          </div>
          <Link
            href={`/checkout?listing=${l.id}`}
            className="px-6 py-3.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors"
          >
            Reserve
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
