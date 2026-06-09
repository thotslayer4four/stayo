'use client'

import { useState } from 'react'

const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank', 'First Bank',
  'First City Monument Bank (FCMB)', 'Guaranty Trust Bank (GTB)', 'Heritage Bank',
  'Keystone Bank', 'Opay', 'Palmpay', 'Polaris Bank', 'Providus Bank',
  'Sterling Bank', 'Stanbic IBTC', 'Union Bank', 'United Bank for Africa (UBA)',
  'Unity Bank', 'Wema Bank', 'Zenith Bank',
]

interface Props {
  initialBankName: string
  initialAccountNumber: string
  initialAccountName: string
}

export default function PayoutDetailsForm({ initialBankName, initialAccountNumber, initialAccountName }: Props) {
  const [bankName, setBankName] = useState(initialBankName)
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber)
  const [accountName, setAccountName] = useState(initialAccountName)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const hasExisting = !!(initialBankName && initialAccountNumber && initialAccountName)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/host/payout-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_account_name: accountName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'
  const labelClass = 'block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {hasExisting && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-emerald-700 font-medium">Bank details saved. Update below if needed.</p>
        </div>
      )}

      <div>
        <label className={labelClass}>Bank</label>
        <select value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} required>
          <option value="">Select bank</option>
          {NIGERIAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Account number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="0123456789"
          maxLength={10}
          pattern="\d{10}"
          className={inputClass}
          required
        />
        <p className="text-xs text-zinc-400 mt-1">10-digit NUBAN account number</p>
      </div>

      <div>
        <label className={labelClass}>Account name</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="As it appears on your bank statement"
          className={inputClass}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600 font-medium">Bank details saved successfully.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
      >
        {loading ? 'Saving…' : 'Save bank details'}
      </button>
    </form>
  )
}
