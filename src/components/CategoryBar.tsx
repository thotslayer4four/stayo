'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Props {
  activeType: string
  q: string
  checkIn: string
  checkOut: string
  guests: string
  minPrice: string
  maxPrice: string
  sort: string
}

const CATEGORIES = [
  {
    value: 'all',
    label: 'All',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    value: 'shortlet',
    label: 'Shortlets',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    value: 'car',
    label: 'Cars',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function CategoryBar({ activeType, q, checkIn, checkOut, guests, minPrice, maxPrice, sort }: Props) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(!!(minPrice || maxPrice))
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  function buildUrl(overrides: Record<string, string> = {}) {
    const p = new URLSearchParams()
    const type = 'type' in overrides ? overrides.type : activeType
    if (type && type !== 'all') p.set('type', type)
    if (q) p.set('q', q)
    const min = 'min_price' in overrides ? overrides.min_price : localMin
    if (min) p.set('min_price', min)
    const max = 'max_price' in overrides ? overrides.max_price : localMax
    if (max) p.set('max_price', max)
    if (checkIn) p.set('check_in', checkIn)
    if (checkOut) p.set('check_out', checkOut)
    if (guests && guests !== '1') p.set('guests', guests)
    const s = 'sort' in overrides ? overrides.sort : sort
    if (s && s !== 'newest') p.set('sort', s)
    // page intentionally omitted — any filter/sort change resets to page 1
    return `/?${p.toString()}`
  }

  function setType(type: string) {
    router.push(buildUrl({ type }))
  }

  function setSort(s: string) {
    router.push(buildUrl({ sort: s }))
  }

  function applyPrice() {
    router.push(buildUrl())
    setShowFilters(false)
  }

  function clearPrice() {
    setLocalMin('')
    setLocalMax('')
    router.push(buildUrl({ min_price: '', max_price: '' }))
    setShowFilters(false)
  }

  const hasPriceFilter = !!(minPrice || maxPrice)

  return (
    <div className="sticky top-20 z-30 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Scrollable category tabs */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center py-3 w-full md:w-max md:gap-8">
              {CATEGORIES.map((cat) => {
                const isActive = activeType === cat.value
                return (
                  <button
                    key={cat.value}
                    onClick={() => setType(cat.value)}
                    className={`relative flex flex-col items-center gap-1.5 pb-3 flex-1 md:flex-shrink-0 transition-colors ${
                      isActive ? 'text-brand' : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="cat-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort + Filter controls — desktop only */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 py-3">
            {/* Sort select */}
            <div className="relative">
              <select
                value={sort || 'newest'}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 bg-white hover:border-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                aria-label="Sort listings"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                hasPriceFilter
                  ? 'border-brand bg-brand text-white'
                  : showFilters
                  ? 'border-zinc-300 bg-zinc-50 text-zinc-900'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
              {hasPriceFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Price filter panel — animated accordion */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-zinc-100 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <p className="text-sm font-semibold text-zinc-900 mb-4">Price range</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Min (₦)</label>
                    <input
                      type="number"
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-36 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Max (₦)</label>
                    <input
                      type="number"
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      placeholder="Any"
                      min="0"
                      className="w-36 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={applyPrice}
                    className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
                  >
                    Apply
                  </button>
                  {hasPriceFilter && (
                    <button
                      onClick={clearPrice}
                      className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
