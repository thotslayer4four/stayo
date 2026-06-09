import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate } from '@/lib/utils'
import PromoActions from './PromoActions'
import CreatePromoForm from './CreatePromoForm'

export default async function AdminPromoPage() {
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from('promo_codes')
    .select('id, code, type, discount_type, discount_value, max_uses, uses_count, expires_at, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Promo Codes</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          {!codes || codes.length === 0 ? (
            <p className="px-6 py-12 text-sm text-zinc-400 text-center">No promo codes yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Code', 'Discount', 'Uses', 'Expires', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {codes.map((c) => {
                    const discountLabel =
                      c.discount_type === 'percentage'
                        ? `${c.discount_value}%`
                        : formatNaira(c.discount_value)
                    const usageLabel = c.max_uses != null ? `${c.uses_count}/${c.max_uses}` : `${c.uses_count}`
                    const expired = c.expires_at && new Date(c.expires_at) < new Date()

                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <code className="text-sm font-mono font-bold text-zinc-900 tracking-wider">{c.code}</code>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">{discountLabel} off</td>
                        <td className="px-5 py-3.5 text-zinc-600">{usageLabel}</td>
                        <td className="px-5 py-3.5 text-zinc-600">
                          {c.expires_at ? formatDate(c.expires_at) : 'Never'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            !c.is_active || expired
                              ? 'bg-zinc-100 text-zinc-500'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {!c.is_active ? 'Disabled' : expired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <PromoActions id={c.id} isActive={c.is_active} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create form */}
        <CreatePromoForm />
      </div>
    </div>
  )
}
