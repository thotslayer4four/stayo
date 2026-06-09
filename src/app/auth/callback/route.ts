import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const ref = searchParams.get('ref') // referral code from login URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existing) {
          // Resolve referral code to referrer user ID
          let referredBy: string | null = null
          if (ref) {
            const { data: referrer } = await supabase
              .from('users')
              .select('id')
              .eq('referral_code', ref)
              .single()
            referredBy = referrer?.id ?? null
          }

          await supabase.from('users').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: 'guest',
            auth_provider: 'google',
            referral_code: generateReferralCode(),
            referred_by: referredBy,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
