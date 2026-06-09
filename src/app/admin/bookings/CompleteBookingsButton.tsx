'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteBookingsButton() {
  const router = useRouter()
  const [ran, setRan] = useState(false)
  const [updated, setUpdated] = useState(0)

  // Auto-run once on mount to complete past bookings
  useEffect(() => {
    if (ran) return
    setRan(true)
    fetch('/api/admin/bookings/complete', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.updated > 0) {
          setUpdated(d.updated)
          router.refresh()
        }
      })
      .catch(() => {})
  }, [ran, router])

  if (updated === 0) return null

  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-zinc-100 text-xs text-zinc-500 font-medium">
      {updated} past booking{updated !== 1 ? 's' : ''} automatically marked as completed
    </div>
  )
}
