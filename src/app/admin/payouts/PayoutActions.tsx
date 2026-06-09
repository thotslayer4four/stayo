'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  bookingId: string
  hostId: string
  amount: number
  payoutId: string | null
}

export default function PayoutActions({ bookingId, hostId, amount, payoutId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function createPayout() {
    setLoading(true)
    await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, host_id: hostId, amount }),
    })
    router.refresh()
    setLoading(false)
  }

  async function markPaid() {
    if (!payoutId) return
    setLoading(true)
    await fetch(`/api/admin/payouts/${payoutId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'bank_transfer' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {!payoutId ? (
        <button
          onClick={createPayout}
          disabled={loading}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          Create payout
        </button>
      ) : (
        <button
          onClick={markPaid}
          disabled={loading}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          Mark paid
        </button>
      )}
    </div>
  )
}
