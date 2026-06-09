'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatNaira } from '@/lib/utils'
import type { Listing, DbUser } from '@/types'
import BundleCarSelector from './BundleCarSelector'

interface CheckoutFormProps {
  listing: Listing
  profile: DbUser
  checkIn: string
  checkOut: string
  guests: number
  duration: number
  unit: string       // 'hours' | 'days' | 'nights'
  subtotal: number
  availableCars: Listing[]
}

function durationLabel(duration: number, unit: string): string {
  if (unit === 'hours') return `${duration} ${duration === 1 ? 'hour' : 'hours'}`
  if (unit === 'nights') return `${duration} ${duration === 1 ? 'night' : 'nights'}`
  return `${duration} ${duration === 1 ? 'day' : 'days'}`
}

export default function CheckoutForm({
  listing,
  profile,
  checkIn,
  checkOut,
  guests,
  duration,
  unit,
  subtotal,
  availableCars,
}: CheckoutFormProps) {
  const router = useRouter()
  const isHourly = unit === 'hours'

  const [phone, setPhone] = useState(profile.phone ?? '')
  const [selectedCar, setSelectedCar] = useState<Listing | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [error, setError] = useState('')

  // For bundled cars always use daily price since bundle is daily
  const carSubtotal = selectedCar
    ? (selectedCar.price_per_day ?? selectedCar.price_per_night ?? 0) * duration
    : 0
  const baseTotal = subtotal + carSubtotal
  const total = baseTotal - promoDiscount

  // Unit label for the listing price row
  const listingPricePerUnit = isHourly
    ? (listing.price_per_hour ?? Math.round((listing.price_per_day ?? 0) / 24))
    : listing.type === 'shortlet'
    ? listing.price_per_night
    : listing.price_per_day

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoError('')
    setPromoLoading(true)

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })
      const data = await res.json()

      if (data.valid) {
        const discount =
          data.discount_type === 'percentage'
            ? Math.round((baseTotal * data.discount_value) / 100)
            : data.discount_value
        setPromoDiscount(discount)
        setPromoApplied(true)
      } else {
        setPromoError('Invalid or expired promo code')
      }
    } finally {
      setPromoLoading(false)
    }
  }

  async function handlePay() {
    if (!phone.trim()) return
    setPayLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          unit,
          promo_code: promoApplied ? promoCode : null,
          phone,
          car_id: selectedCar?.id ?? null,
          car_check_in: selectedCar ? checkIn : null,
          car_check_out: selectedCar ? checkOut : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')

      if (data.payment_url) {
        window.location.href = data.payment_url
      } else if (data.booking_id) {
        router.push(`/bookings/${data.booking_id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPayLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Guest details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Your details</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={profile.full_name ?? ''}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-100 text-sm text-zinc-500 bg-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-100 text-sm text-zinc-500 bg-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              WhatsApp number <span className="text-red-400 normal-case font-normal">required</span>
            </label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <p className="text-xs text-zinc-400 mt-1.5">Booking confirmation will be sent here</p>
          </div>
        </div>
      </div>

      {/* Bundle car selector — only for shortlet bookings */}
      {listing.type === 'shortlet' && (
        <BundleCarSelector
          cars={availableCars}
          checkIn={checkIn}
          checkOut={checkOut}
          selected={selectedCar}
          onSelect={setSelectedCar}
        />
      )}

      {/* Promo code */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Promo code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="STAYO-XXXX"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase())
              setPromoError('')
              if (promoApplied) {
                setPromoApplied(false)
                setPromoDiscount(0)
              }
            }}
            disabled={promoApplied}
            className="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:text-zinc-500"
          />
          <button
            onClick={applyPromo}
            disabled={!promoCode || promoApplied || promoLoading}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
          >
            {promoApplied ? '✓' : promoLoading ? '…' : 'Apply'}
          </button>
        </div>
        {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
        {promoApplied && (
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            Code applied — you save {formatNaira(promoDiscount)}
          </p>
        )}
      </div>

      {/* Price summary — mobile only */}
      <div className="lg:hidden rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">
              {formatNaira(listingPricePerUnit ?? 0)} × {durationLabel(duration, unit)}
            </span>
            <span className="text-zinc-900 font-medium">{formatNaira(subtotal)}</span>
          </div>
          {selectedCar && (
            <div className="flex justify-between">
              <span className="text-zinc-500">{selectedCar.title} × {duration} days</span>
              <span className="text-zinc-900 font-medium">{formatNaira(carSubtotal)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promo discount</span>
              <span>−{formatNaira(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-zinc-900 text-base pt-2.5 border-t border-zinc-100">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button
        onClick={handlePay}
        disabled={payLoading || !phone.trim()}
        className="w-full py-4 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {payLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </>
        ) : (
          `Pay ${formatNaira(total)} with Paystack`
        )}
      </button>

      <p className="text-xs text-center text-zinc-400">Secured by Paystack · SSL encrypted</p>
    </div>
  )
}
