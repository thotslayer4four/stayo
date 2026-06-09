'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PromoActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/promo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          : 'text-blue-600 hover:bg-blue-50'
      }`}
    >
      {isActive ? 'Disable' : 'Enable'}
    </button>
  )
}
