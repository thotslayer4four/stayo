'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ROLES = ['guest', 'host', 'admin'] as const

export default function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  async function updateRole(newRole: string) {
    setLoading(true)
    setRole(newRole)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <select
      value={role}
      onChange={(e) => updateRole(e.target.value)}
      disabled={loading}
      className="text-xs font-medium border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 capitalize"
    >
      {ROLES.map((r) => (
        <option key={r} value={r} className="capitalize">{r}</option>
      ))}
    </select>
  )
}
