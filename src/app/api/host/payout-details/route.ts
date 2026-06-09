import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getHostUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['host', 'admin'].includes(profile.role)) return null
  return { supabase, userId: user.id }
}

export async function POST(request: Request) {
  const ctx = await getHostUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bank_name, bank_account_number, bank_account_name } = await request.json()

  if (!bank_name || !bank_account_number || !bank_account_name) {
    return NextResponse.json({ error: 'All bank detail fields are required' }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from('users')
    .update({ bank_name, bank_account_number, bank_account_name })
    .eq('id', ctx.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
