import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'check_in and check_out required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: blocked } = await supabase
    .from('availability')
    .select('date, reason')
    .eq('listing_id', id)
    .gte('date', checkIn)
    .lt('date', checkOut)

  const blockedDates = blocked?.map((b) => b.date) ?? []

  return NextResponse.json({
    available: blockedDates.length === 0,
    blocked_dates: blockedDates,
  })
}
