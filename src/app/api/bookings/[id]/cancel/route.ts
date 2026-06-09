import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the booking — must belong to this user
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, payment_status, guest_id')
    .eq('id', id)
    .eq('guest_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Only allow cancellation if payment hasn't gone through yet
  if (booking.payment_status === 'paid') {
    return NextResponse.json(
      { error: 'Paid bookings cannot be cancelled here. Contact support.' },
      { status: 400 }
    )
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
  }

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
