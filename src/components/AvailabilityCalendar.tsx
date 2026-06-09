'use client'

import { useState } from 'react'

interface AvailabilityDay {
  date: string
  reason: 'booked' | 'manual'
  bookingId: string | null
}

interface Props {
  listingId: string
  availability: AvailabilityDay[]
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AvailabilityCalendar({ listingId, availability }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Map<string, AvailabilityDay>>(
    new Map(availability.map((a) => [a.date, a]))
  )
  const [loading, setLoading] = useState<string | null>(null)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().split('T')[0]

  async function toggleDate(dateStr: string) {
    const existing = blocked.get(dateStr)
    if (existing?.reason === 'booked') return // can't unblock booked dates
    setLoading(dateStr)

    if (existing?.reason === 'manual') {
      // Unblock
      await fetch(`/api/host/availability?listing_id=${listingId}&date=${dateStr}`, {
        method: 'DELETE',
      })
      const next = new Map(blocked)
      next.delete(dateStr)
      setBlocked(next)
    } else {
      // Block
      await fetch('/api/host/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, date: dateStr, reason: 'manual' }),
      })
      const next = new Map(blocked)
      next.set(dateStr, { date: dateStr, reason: 'manual', bookingId: null })
      setBlocked(next)
    }

    setLoading(null)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
          <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-zinc-900">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
          <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-zinc-400 py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${year}-${mm}-${dd}`
          const isPast = dateStr < todayStr
          const status = blocked.get(dateStr)
          const isBooked = status?.reason === 'booked'
          const isManual = status?.reason === 'manual'
          const isLoading = loading === dateStr

          let cellClass = 'w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors '

          if (isPast) {
            cellClass += 'text-zinc-300 cursor-default'
          } else if (isBooked) {
            cellClass += 'bg-red-100 text-red-400 cursor-not-allowed line-through'
          } else if (isManual) {
            cellClass += 'bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200'
          } else {
            cellClass += 'text-zinc-700 cursor-pointer hover:bg-zinc-100 border border-zinc-200'
          }

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && !isLoading && toggleDate(dateStr)}
              disabled={isPast || isBooked || isLoading}
              className={cellClass}
            >
              {isLoading ? (
                <svg className="w-3 h-3 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : day}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-zinc-400 mt-4 text-center">
        Click an available date to block it · Click a blocked date to unblock
      </p>
    </div>
  )
}
