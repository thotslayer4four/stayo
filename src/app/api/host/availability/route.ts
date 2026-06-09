import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getHostUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['host', 'admin'].includes(profile.role)) return null
  return { supabase, userId: user.id, role: profile.role }
}

export async function POST(request: Request) {
  const ctx = await getHostUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id, date, reason } = await request.json()

  // Verify listing ownership (unless admin)
  if (ctx.role !== 'admin') {
    const { data: listing } = await ctx.supabase
      .from('listings')
      .select('host_id')
      .eq('id', listing_id)
      .single()
    if (listing?.host_id !== ctx.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await ctx.supabase.from('availability').insert({
    listing_id,
    date,
    reason: reason ?? 'manual',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: Request) {
  const ctx = await getHostUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const listing_id = searchParams.get('listing_id')
  const date = searchParams.get('date')

  if (!listing_id || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // Only allow deleting manual blocks
  const { error } = await ctx.supabase
    .from('availability')
    .delete()
    .eq('listing_id', listing_id)
    .eq('date', date)
    .eq('reason', 'manual')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
