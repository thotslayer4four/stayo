'use client'

import { useState } from 'react'
import ListingCard from './ListingCard'
import { todayStr } from '@/lib/utils'
import type { Listing } from '@/types'

type Purpose = 'business' | 'leisure' | 'student'

interface Result {
  shortlet: Listing | null
  car: Listing | null
  reasoning: string
}

export default function AIRecommendations() {
  const [open, setOpen] = useState(false)
  const [purpose, setPurpose] = useState<Purpose>('leisure')
  const [groupSize, setGroupSize] = useState(2)
  const [budget, setBudget] = useState('150000')
  const [checkIn, setCheckIn] = useState(todayStr())
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function getRecommendation() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, groupSize, budget: Number(budget), checkIn, checkOut }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'

  return (
    <div className="mb-10">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-800">Get AI recommendations</p>
            <p className="text-xs text-zinc-400">Tell us your plans, we&apos;ll find the perfect shortlet + car combo</p>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Find your perfect stay</h2>
              <p className="text-xs text-zinc-400 mt-0.5">AI-powered recommendations for Abuja</p>
            </div>
            <button onClick={() => { setOpen(false); setResult(null) }} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!result ? (
            <div className="space-y-4">
              {/* Purpose */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">What&apos;s the occasion?</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'leisure', label: 'Leisure', emoji: '🌴' },
                    { value: 'business', label: 'Business', emoji: '💼' },
                    { value: 'student', label: 'Student', emoji: '🎓' },
                  ] as const).map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPurpose(p.value)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        purpose === p.value ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates + guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Check-in</label>
                  <input type="date" value={checkIn} min={todayStr()} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Check-out</label>
                  <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Group size</label>
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                    <button onClick={() => setGroupSize((g) => Math.max(1, g - 1))} className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 text-lg">−</button>
                    <span className="flex-1 text-center text-sm font-semibold text-zinc-900">{groupSize}</span>
                    <button onClick={() => setGroupSize((g) => Math.min(20, g + 1))} className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 text-lg">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Budget (₦)</label>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="150000" className={inputClass} />
                </div>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={getRecommendation}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Finding your perfect match…
                  </>
                ) : (
                  'Get recommendations'
                )}
              </button>
            </div>
          ) : (
            <div>
              {result.reasoning && (
                <div className="flex gap-2 items-start mb-5 p-3 rounded-xl bg-zinc-50">
                  <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-xs text-zinc-600">{result.reasoning}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {result.shortlet && <ListingCard listing={result.shortlet} />}
                {result.car && <ListingCard listing={result.car} />}
                {!result.shortlet && !result.car && (
                  <p className="text-sm text-zinc-500 col-span-2">No listings match your criteria yet. Check back soon!</p>
                )}
              </div>

              <button
                onClick={() => setResult(null)}
                className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                ← Try different criteria
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
