'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
}

export default function CancelBookingButton({ bookingId }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-800 mb-1">Cancel this booking?</p>
        <p className="text-sm text-red-600 mb-4">This action cannot be undone.</p>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {loading ? 'Cancelling…' : 'Yes, cancel'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Keep booking
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-3 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-medium hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      Cancel booking
    </button>
  )
}
