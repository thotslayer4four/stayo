'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  id: string
  isApproved: boolean
  isActive: boolean
}

export default function AdminListingActions({ id, isApproved, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function update(patch: Record<string, boolean>) {
    setLoading(true)
    await fetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/listings/${id}/edit`}
        className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-100"
      >
        Edit
      </Link>
      {!isApproved && (
        <button
          onClick={() => update({ is_approved: true, is_active: true })}
          disabled={loading}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={() => update({ is_active: !isActive })}
        disabled={loading}
        className={`text-xs font-medium transition-colors px-2.5 py-1.5 rounded-lg disabled:opacity-50 ${
          isActive
            ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  )
}
