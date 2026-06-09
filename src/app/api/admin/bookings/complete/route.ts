import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? supabase : null
}

// Marks all confirmed+paid bookings whose latest check_out has passed as completed.
export async function POST() {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  // Find booking IDs where every item's check_out is before today
  const { data: pastItems } = await supabase
    .from('booking_items')
    .select('booking_id, check_out')

  if (!pastItems) return NextResponse.json({ updated: 0 })

  // Group by booking_id, find max check_out
  const maxCheckOut = new Map<string, string>()
  for (const item of pastItems) {
    const existing = maxCheckOut.get(item.booking_id)
    if (!existing || item.check_out > existing) {
      maxCheckOut.set(item.booking_id, item.check_out)
    }
  }

  const pastBookingIds = Array.from(maxCheckOut.entries())
    .filter(([, maxOut]) => maxOut < today)
    .map(([id]) => id)

  if (pastBookingIds.length === 0) return NextResponse.json({ updated: 0 })

  await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .in('id', pastBookingIds)
    .eq('status', 'confirmed')
    .eq('payment_status', 'paid')

  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('id', pastBookingIds)
    .eq('status', 'completed')

  return NextResponse.json({ updated: count ?? 0 })
}
