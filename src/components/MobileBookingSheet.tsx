'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { formatNaira, calcNights, todayStr } from '@/lib/utils'
import type { Listing } from '@/types'
import DateRangePicker from './DateRangePicker'

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => i + 6) // 6 AM → 11 PM

function formatHour(h: number): string {
  if (h === 12) return '12 PM'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

function padHour(h: number) {
  return String(h).padStart(2, '0')
}

export default function MobileBookingSheet({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const isCar = listing.type === 'car'
  const isShortlet = listing.type === 'shortlet'
  const today = todayStr()

  const [unit, setUnit] = useState<'hourly' | 'daily'>('daily')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(13)
  const [guests, setGuests] = useState(1)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(true)

  function handleUnitChange(u: 'hourly' | 'daily') {
    setUnit(u)
    setCheckIn('')
    setCheckOut('')
  }

  useEffect(() => {
    async function fetchBlocked() {
      const sixMonths = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      try {
        const res = await fetch(
          `/api/listings/${listing.id}/availability?check_in=${today}&check_out=${sixMonths}`
        )
        const data = await res.json()
        setBlockedDates(data.blocked_dates ?? [])
      } catch {
        // non-critical
      } finally {
        setLoadingBlocked(false)
      }
    }
    fetchBlocked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id])

  const isHourlyMode = isCar && unit === 'hourly'
  const hourlyRate =
    listing.price_per_hour ?? Math.round((listing.price_per_day ?? 0) / 24)
  const hours = isHourlyMode ? Math.max(0, endHour - startHour) : 0
  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut])

  const pricePerUnit = isHourlyMode
    ? hourlyRate
    : isShortlet
    ? listing.price_per_night
    : listing.price_per_day

  const total = isHourlyMode ? hourlyRate * hours : (pricePerUnit ?? 0) * nights

  const isHourlyValid = isHourlyMode && !!checkIn && hours > 0
  const isDailyValid = !isHourlyMode && nights > 0
  const isValid = isHourlyValid || isDailyValid

  const unitLabel = isHourlyMode ? 'hour' : isShortlet ? 'night' : 'day'
  const unitLabelPlural = isHourlyMode ? 'hours' : isShortlet ? 'nights' : 'days'
  const count = isHourlyMode ? hours : nights

  const displayPrice = isHourlyMode
    ? hourlyRate
    : isShortlet
    ? listing.price_per_night
    : listing.price_per_day
  const displayPriceUnit = isHourlyMode ? '/hr' : isShortlet ? '/night' : '/day'

  const staticPrice = isShortlet ? listing.price_per_night : listing.price_per_day
  const staticPriceUnit = isShortlet ? '/night' : '/day'
  const staticHourlyRate = isCar
    ? listing.price_per_hour ??
      (listing.price_per_day ? Math.round(listing.price_per_day / 24) : null)
    : null

  function book() {
    if (!isValid) return
    if (isHourlyMode) {
      const params = new URLSearchParams({
        listing: listing.id,
        check_in: `${checkIn}T${padHour(startHour)}:00`,
        check_out: `${checkIn}T${padHour(endHour)}:00`,
        unit: 'hours',
      })
      router.push(`/checkout?${params}`)
    } else {
      const params = new URLSearchParams({
        listing: listing.id,
        check_in: checkIn,
        check_out: checkOut,
      })
      if (isShortlet) params.set('guests', String(guests))
      router.push(`/checkout?${params}`)
    }
    setOpen(false)
  }

  const reserveLabel = isHourlyMode
    ? !checkIn
      ? 'Select a date'
      : hours <= 0
      ? 'Select return time'
      : 'Reserve'
    : !checkIn
    ? 'Select check-in'
    : !checkOut
    ? 'Select check-out'
    : 'Reserve'

  return (
    <>
      {/* ── Sticky trigger bar — hidden on desktop (has sidebar BookingPanel) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-zinc-100 px-4 z-40"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="py-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-zinc-900">
                {staticPrice != null ? formatNaira(staticPrice) : '—'}
              </span>
              <span className="text-sm text-zinc-500">{staticPriceUnit}</span>
            </div>
            {staticHourlyRate != null && (
              <span className="text-xs text-zinc-400">
                {formatNaira(staticHourlyRate)}/hr
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-6 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            Reserve
          </button>
        </div>
      </div>

      {/* ── Bottom sheet ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55] bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl flex flex-col"
              style={{ maxHeight: '92dvh' }}
            >
              {/* Handle + Header */}
              <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-zinc-100">
                <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-zinc-900">
                      {isShortlet ? 'Book this property' : 'Rent this car'}
                    </p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {displayPrice != null ? formatNaira(displayPrice) : '—'}
                      {displayPriceUnit}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Unit toggle — cars only */}
                {isCar && (
                  <div className="flex rounded-xl border border-zinc-200 p-1 gap-1">
                    <button
                      onClick={() => handleUnitChange('daily')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        unit === 'daily'
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      By the day
                    </button>
                    <button
                      onClick={() => handleUnitChange('hourly')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        unit === 'hourly'
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      By the hour
                    </button>
                  </div>
                )}

                {/* Date hint */}
                {isHourlyMode ? (
                  !checkIn ? (
                    <p className="text-xs font-semibold text-zinc-500">Select a date below</p>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Date selected — set pick-up and return time below
                    </p>
                  )
                ) : (
                  <>
                    {!checkIn && (
                      <p className="text-xs font-semibold text-zinc-500">Select your dates below</p>
                    )}
                    {checkIn && !checkOut && (
                      <p className="text-xs font-semibold text-brand">
                        Now select your {isShortlet ? 'check-out' : 'return'} date
                      </p>
                    )}
                    {checkIn && checkOut && (
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {nights} {nights === 1 ? unitLabel : unitLabelPlural} selected
                      </p>
                    )}
                  </>
                )}

                {/* Calendar */}
                {loadingBlocked ? (
                  <div className="flex items-center justify-center h-40 text-zinc-400 text-xs gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Loading availability…
                  </div>
                ) : (
                  <DateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(ci, co) => {
                      setCheckIn(ci)
                      setCheckOut(co)
                    }}
                    blockedDates={blockedDates}
                    minDate={today}
                    singleMonth
                    singleDateMode={isHourlyMode}
                  />
                )}

                {/* Hourly time pickers */}
                <AnimatePresence>
                  {isHourlyMode && checkIn && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">
                          Pick-up time
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {TIME_SLOTS.map((h) => (
                            <button
                              key={h}
                              onClick={() => {
                                setStartHour(h)
                                if (endHour <= h) setEndHour(h + 1)
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                                startHour === h
                                  ? 'bg-brand text-white'
                                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                              }`}
                            >
                              {formatHour(h)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">
                          Return time
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {TIME_SLOTS.filter((h) => h > startHour).map((h) => (
                            <button
                              key={h}
                              onClick={() => setEndHour(h)}
                              className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                                endHour === h
                                  ? 'bg-brand text-white'
                                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                              }`}
                            >
                              {formatHour(h)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Guests — shortlets only */}
                {isShortlet && (
                  <div className="border border-zinc-200 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">
                      Guests
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">
                        {guests} {guests === 1 ? 'guest' : 'guests'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          disabled={guests <= 1}
                          className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-800 transition-colors disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-zinc-900 w-4 text-center">
                          {guests}
                        </span>
                        <button
                          onClick={() => setGuests((g) =>
                            Math.min(listing.max_guests ?? 20, g + 1)
                          )}
                          className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-800 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price breakdown */}
                {isValid && pricePerUnit != null && (
                  <div className="flex justify-between text-sm text-zinc-600 pb-1 border-b border-zinc-100">
                    <span>
                      {formatNaira(pricePerUnit)} × {count}{' '}
                      {count === 1 ? unitLabel : unitLabelPlural}
                    </span>
                    <span className="font-bold text-zinc-900">{formatNaira(total)}</span>
                  </div>
                )}
              </div>

              {/* Fixed CTA */}
              <div
                className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-zinc-100"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <button
                  onClick={book}
                  disabled={!isValid}
                  className="w-full py-4 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {reserveLabel}
                </button>
                <p className="text-xs text-zinc-400 text-center mt-2">
                  You won&apos;t be charged yet
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
