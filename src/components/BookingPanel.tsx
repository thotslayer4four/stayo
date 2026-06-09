'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { formatNaira, calcNights, calcHours, todayStr } from '@/lib/utils'
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

export default function BookingPanel({ listing }: { listing: Listing }) {
  const router = useRouter()
  const isCar = listing.type === 'car'
  const isShortlet = listing.type === 'shortlet'

  const today = todayStr()

  // Cars can toggle between hourly and daily
  const [unit, setUnit] = useState<'hourly' | 'daily'>('daily')

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(13)
  const [guests, setGuests] = useState(1)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(true)

  // Reset date selection when toggling unit
  function handleUnitChange(u: 'hourly' | 'daily') {
    setUnit(u)
    setCheckIn('')
    setCheckOut('')
  }

  useEffect(() => {
    async function fetchBlocked() {
      const sixMonths = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

  // Derived hourly rate: use price_per_hour if set, else derive from daily
  const hourlyRate = listing.price_per_hour ?? Math.round((listing.price_per_day ?? 0) / 24)

  const hours = isHourlyMode ? Math.max(0, endHour - startHour) : 0
  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut])

  const pricePerUnit = isHourlyMode
    ? hourlyRate
    : isShortlet
    ? listing.price_per_night
    : listing.price_per_day

  const total = isHourlyMode
    ? hourlyRate * hours
    : (pricePerUnit ?? 0) * nights

  const isHourlyValid = isHourlyMode && !!checkIn && hours > 0
  const isDailyValid = !isHourlyMode && nights > 0
  const isValid = isHourlyValid || isDailyValid

  const unitLabel = isHourlyMode ? 'hour' : isShortlet ? 'night' : 'day'
  const unitLabelPlural = isHourlyMode ? 'hours' : isShortlet ? 'nights' : 'days'
  const count = isHourlyMode ? hours : nights

  function book() {
    if (!isValid) return

    if (isHourlyMode) {
      const startStr = `${checkIn}T${padHour(startHour)}:00`
      const endStr = `${checkIn}T${padHour(endHour)}:00`
      const params = new URLSearchParams({
        listing: listing.id,
        check_in: startStr,
        check_out: endStr,
        unit: 'hours',
      })
      router.push(`/checkout?${params}`)
    } else {
      const params = new URLSearchParams({ listing: listing.id, check_in: checkIn, check_out: checkOut })
      if (isShortlet) params.set('guests', String(guests))
      router.push(`/checkout?${params}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.08 }}
      className="rounded-2xl border border-zinc-200 bg-white shadow-lg p-6"
    >
      {/* Price header */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-2xl font-extrabold text-zinc-900">
          {pricePerUnit != null ? formatNaira(pricePerUnit) : '—'}
        </span>
        <span className="text-sm text-zinc-500 font-normal">
          / {isHourlyMode ? 'hour' : isShortlet ? 'night' : 'day'}
        </span>
        {isCar && !isHourlyMode && listing.price_per_hour && (
          <span className="ml-1 text-xs text-zinc-400">
            · {formatNaira(listing.price_per_hour)}/hr
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-zinc-700">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          New
        </span>
      </div>

      {/* Unit toggle — cars only */}
      {isCar && (
        <div className="flex rounded-xl border border-zinc-200 p-1 mb-5 gap-1">
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
          <p className="text-xs font-semibold text-zinc-500 mb-3">Select a date below</p>
        ) : (
          <p className="text-xs font-semibold text-emerald-600 mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Date selected — set pick-up and return time below
          </p>
        )
      ) : (
        <>
          {!checkIn && (
            <p className="text-xs font-semibold text-zinc-500 mb-3">Select your dates below</p>
          )}
          {checkIn && !checkOut && (
            <p className="text-xs font-semibold text-brand mb-3">
              Now select your {isShortlet ? 'check-out' : 'return'} date
            </p>
          )}
          {checkIn && checkOut && (
            <p className="text-xs font-semibold text-emerald-600 mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {nights} {nights === 1 ? unitLabel : unitLabelPlural} selected
            </p>
          )}
        </>
      )}

      {/* Calendar */}
      <div className="mb-4 -mx-1">
        {loadingBlocked ? (
          <div className="flex items-center justify-center h-48 text-zinc-400 text-xs gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading availability…
          </div>
        ) : (
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
            blockedDates={blockedDates}
            minDate={today}
            singleMonth
            singleDateMode={isHourlyMode}
          />
        )}
      </div>

      {/* Blocked date legend */}
      {blockedDates.length > 0 && !loadingBlocked && (
        <div className="flex items-center gap-2 mb-4 text-xs text-zinc-400">
          <span className="inline-block w-3 h-px border-t-2 border-zinc-300 line-through bg-zinc-100 rounded" />
          Strikethrough dates are unavailable
        </div>
      )}

      {/* Hourly time pickers */}
      <AnimatePresence>
        {isHourlyMode && checkIn && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-4 space-y-4"
          >
            {/* Pick-up time */}
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
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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

            {/* Return time */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">
                Return time
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_SLOTS.filter((h) => h > startHour).map((h) => (
                  <button
                    key={h}
                    onClick={() => setEndHour(h)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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
        <div className="border border-zinc-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">Guests</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900">
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                aria-label="Remove guest"
                className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-800 transition-colors disabled:opacity-30"
              >
                −
              </button>
              <span className="text-sm font-bold text-zinc-900 w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests((g) => Math.min(listing.max_guests ?? 20, g + 1))}
                aria-label="Add guest"
                className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-800 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <AnimatePresence>
        {isValid && pricePerUnit != null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex justify-between text-sm text-zinc-600 mb-4 pb-4 border-b border-zinc-100"
          >
            <span>
              {formatNaira(pricePerUnit)} × {count} {count === 1 ? unitLabel : unitLabelPlural}
            </span>
            <span className="font-bold text-zinc-900">{formatNaira(total)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={book}
        disabled={!isValid}
        className="w-full py-3.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isHourlyMode
          ? !checkIn
            ? 'Select a date'
            : hours <= 0
            ? 'Select return time'
            : 'Reserve'
          : !checkIn
          ? 'Select check-in date'
          : !checkOut
          ? 'Select check-out date'
          : 'Reserve'}
      </button>

      <p className="text-xs text-zinc-400 text-center mt-3">You won&apos;t be charged yet</p>
    </motion.div>
  )
}
