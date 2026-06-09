import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ valid: false })
  }

  const supabase = await createClient()

  const { data: promo } = await supabase
    .from('promo_codes')
    .select('discount_type, discount_value, expires_at, max_uses, uses_count')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promo) return NextResponse.json({ valid: false })

  const expired = promo.expires_at && new Date(promo.expires_at) < new Date()
  const exhausted = promo.max_uses != null && promo.uses_count >= promo.max_uses

  if (expired || exhausted) return NextResponse.json({ valid: false })

  return NextResponse.json({
    valid: true,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
  })
}
