'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePromoForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setCode(`STAYO-${random}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          max_uses: maxUses ? Number(maxUses) : null,
          expires_at: expiresAt || null,
          is_active: true,
          type: 'promo',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setSuccess(true)
      setCode('')
      setDiscountValue('')
      setMaxUses('')
      setExpiresAt('')
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'
  const labelClass = 'block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-zinc-900 mb-5">Create promo code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="STAYO-XXXX"
              className={`${inputClass} flex-1`}
              required
            />
            <button
              type="button"
              onClick={generateCode}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Discount type</label>
          <div className="flex gap-2">
            {(['percentage', 'fixed'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDiscountType(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                  discountType === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {t === 'percentage' ? '% Off' : '₦ Fixed'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Value ({discountType === 'percentage' ? '%' : '₦'})</label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? '10' : '5000'}
            min="1"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Max uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Unlimited"
              min="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Expires</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-emerald-600 font-medium">Promo code created!</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {loading ? 'Creating…' : 'Create code'}
        </button>
      </form>
    </div>
  )
}
