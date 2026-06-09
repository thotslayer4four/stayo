'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatNaira } from '@/lib/utils'
import type { Listing } from '@/types'

interface Props {
  cars: Listing[]
  checkIn: string
  checkOut: string
  onSelect: (car: Listing | null) => void
  selected: Listing | null
}

export default function BundleCarSelector({ cars, checkIn, checkOut, onSelect, selected }: Props) {
  const [open, setOpen] = useState(false)

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1

  if (cars.length === 0) return null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2v-1a2 2 0 012-2h.5M16 16h2a2 2 0 002-2v-1a2 2 0 00-2-2h-.5M8 16l-1-4h10l-1 4M8 16h8" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l1-4h8l1 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Add a car rental</p>
            {selected ? (
              <p className="text-xs text-blue-600 font-medium mt-0.5">{selected.title} · {formatNaira((selected.price_per_night ?? selected.price_per_day ?? 0) * nights)}</p>
            ) : (
              <p className="text-xs text-zinc-400 mt-0.5">Bundle with your stay — save time</p>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-zinc-100 divide-y divide-zinc-50">
          {/* No car option */}
          <button
            onClick={() => { onSelect(null); setOpen(false) }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
              !selected ? 'bg-zinc-50' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">No car needed</p>
            </div>
            {!selected && <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
          </button>

          {cars.map((car) => {
            const isSelected = selected?.id === car.id
            const carDayRate = car.price_per_day ?? car.price_per_night ?? 0
            const total = carDayRate * nights

            return (
              <button
                key={car.id}
                onClick={() => { onSelect(car); setOpen(false) }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-zinc-50'
                }`}
              >
                {car.images?.[0] ? (
                  <Image src={car.images[0]} alt={car.title} width={48} height={40} className="rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-10 rounded-lg bg-zinc-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{car.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatNaira(carDayRate)}/day · {nights} {nights === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">{formatNaira(total)}</p>
                  {isSelected && <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
