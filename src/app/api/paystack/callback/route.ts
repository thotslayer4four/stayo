import { createClient } from '@/lib/supabase/server'
import { sendWhatsApp, bookingConfirmedMessage } from '@/lib/termii'
import { formatDate, formatDateTime } from '@/lib/utils'
import { NextResponse } from 'next/server'

function dateRange(checkIn: string, checkOut: string): string[] {
  const dates: string[] = []
  const d = new Date(checkIn)
  const end = new Date(checkOut)
  while (d < end) {
    dates.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(`${origin}/bookings?error=invalid_reference`)
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  const verifyData = await verifyRes.json()

  if (!verifyData.status || verifyData.data?.status !== 'success') {
    return NextResponse.redirect(`${origin}/bookings?error=payment_failed`)
  }

  const supabase = await createClient()

  await supabase
    .from('bookings')
    .update({ status: 'confirmed', payment_status: 'paid' })
    .eq('paystack_reference', reference)

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, total_amount, guest_id,
      users ( full_name, phone, referred_by ),
      booking_items (
        id, listing_id, check_in, check_out,
        listings ( title )
      )
    `)
    .eq('paystack_reference', reference)
    .single()

  if (booking) {
    const user = booking.users as unknown as { full_name: string; phone: string | null; referred_by: string | null }
    const items = booking.booking_items as unknown as Array<{
      id: string
      listing_id: string
      check_in: string
      check_out: string
      listings: { title: string } | null
    }>
    const firstItem = items?.[0]

    // Auto-populate availability (block booked dates)
    if (items?.length) {
      for (const item of items) {
        const dates = dateRange(item.check_in, item.check_out)
        if (dates.length > 0) {
          const rows = dates.map((date) => ({
            listing_id: item.listing_id,
            date,
            reason: 'booked',
            booking_id: booking.id,
          }))
          // Upsert to handle duplicate callback calls gracefully
          await supabase.from('availability').upsert(rows, { onConflict: 'listing_id,date' })
        }
      }
    }

    // WhatsApp notification
    if (user?.phone && firstItem) {
      const listingTitle = (firstItem.listings as unknown as { title: string } | null)?.title ?? 'your booking'
      const fmt = (d: string) => d.includes('T') ? formatDateTime(d) : formatDate(d)
      await sendWhatsApp({
        to: user.phone,
        message: bookingConfirmedMessage({
          guestName: user.full_name?.split(' ')[0] ?? 'there',
          listingTitle,
          checkIn: fmt(firstItem.check_in),
          checkOut: fmt(firstItem.check_out),
          total: booking.total_amount,
          bookingId: booking.id,
        }),
      })
    }

    // Referral reward: only on first paid booking
    const guestId = (booking as unknown as { guest_id: string }).guest_id
    if (user?.referred_by && guestId) {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('guest_id', guestId)
        .eq('payment_status', 'paid')

      if (count === 1) {
        const { data: existing } = await supabase
          .from('referrals')
          .select('id')
          .eq('referred_user_id', guestId)
          .single()

        if (!existing) {
          await supabase.from('referrals').insert({
            referrer_id: user.referred_by,
            referred_user_id: guestId,
            booking_id: booking.id,
            reward_status: 'pending',
          })
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/bookings/${booking?.id}`)
}
