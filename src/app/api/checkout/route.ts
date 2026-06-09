import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const COMMISSION_RATE = 0.1

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    listing_id,
    check_in,
    check_out,
    guests,
    unit,
    promo_code,
    phone,
    car_id,
    car_check_in,
    car_check_out,
  } = body

  if (!listing_id || !check_in || !check_out) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isHourly = unit === 'hours'

  // Fetch primary listing
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listing_id)
    .eq('is_active', true)
    .eq('is_approved', true)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const d1 = new Date(check_in)
  const d2 = new Date(check_out)

  const nightsOrDays = isHourly
    ? Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60))    // hours
    : Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) // days

  if (nightsOrDays <= 0) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  // Availability check — normalize to date strings for the date-based availability table
  const checkInDate = check_in.split('T')[0]
  const checkOutDate = check_out.split('T')[0]

  let blockedQuery = supabase
    .from('availability')
    .select('date')
    .eq('listing_id', listing_id)
    .gte('date', checkInDate)

  // For hourly same-day: include the date; for multi-day: exclude check-out date
  if (isHourly || checkInDate === checkOutDate) {
    blockedQuery = blockedQuery.lte('date', checkOutDate)
  } else {
    blockedQuery = blockedQuery.lt('date', checkOutDate)
  }

  const { data: blocked } = await blockedQuery.limit(1)

  if (blocked && blocked.length > 0) {
    return NextResponse.json({ error: 'Selected dates are no longer available' }, { status: 409 })
  }

  const pricePerUnit: number = isHourly
    ? (listing.price_per_hour ?? Math.round((listing.price_per_day ?? 0) / 24))
    : listing.type === 'shortlet'
    ? listing.price_per_night
    : listing.price_per_day

  let subtotal = pricePerUnit * nightsOrDays

  // Optional car bundle (always daily, even if main booking is hourly)
  let carListing: { id: string; price_per_day: number; title: string } | null = null
  let carNightsOrDays = 0
  let carSubtotal = 0

  if (car_id && car_check_in && car_check_out) {
    const { data: carData } = await supabase
      .from('listings')
      .select('*')
      .eq('id', car_id)
      .eq('type', 'car')
      .eq('is_active', true)
      .single()

    if (carData) {
      carListing = carData
      const cd1 = new Date(car_check_in)
      const cd2 = new Date(car_check_out)
      carNightsOrDays = Math.max(1, Math.round((cd2.getTime() - cd1.getTime()) / (1000 * 60 * 60 * 24)))
      carSubtotal = carData.price_per_day * carNightsOrDays
      subtotal += carSubtotal
    }
  }

  // Promo code
  let discountAmount = 0
  let promoCodeId: string | null = null
  let promoUsesCount = 0

  if (promo_code) {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promo_code.toUpperCase())
      .eq('is_active', true)
      .single()

    const expired = promo?.expires_at && new Date(promo.expires_at) < new Date()
    const exhausted = promo?.max_uses != null && promo.uses_count >= promo.max_uses

    if (promo && !expired && !exhausted) {
      discountAmount =
        promo.discount_type === 'percentage'
          ? Math.round((subtotal * promo.discount_value) / 100)
          : promo.discount_value
      promoCodeId = promo.id
      promoUsesCount = promo.uses_count
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount)
  const commissionAmount = Math.round(totalAmount * COMMISSION_RATE)
  const payoutAmount = totalAmount - commissionAmount

  // Update user phone
  if (phone) {
    await supabase.from('users').update({ phone }).eq('id', user.id)
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      guest_id: user.id,
      status: 'pending',
      total_amount: totalAmount,
      commission_amount: commissionAmount,
      payout_amount: payoutAmount,
      payment_status: 'pending',
      promo_code_id: promoCodeId,
      discount_amount: discountAmount,
    })
    .select()
    .single()

  if (bookingError || !booking) {
    console.error('Booking insert error:', JSON.stringify(bookingError))
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Create primary booking item
  await supabase.from('booking_items').insert({
    booking_id: booking.id,
    listing_id: listing.id,
    type: listing.type,
    check_in,
    check_out,
    price_per_unit: pricePerUnit,
    nights_or_days: nightsOrDays,
    subtotal: pricePerUnit * nightsOrDays,
  })

  // Create car booking item if bundled
  if (carListing && carNightsOrDays > 0) {
    await supabase.from('booking_items').insert({
      booking_id: booking.id,
      listing_id: carListing.id,
      type: 'car',
      check_in: car_check_in,
      check_out: car_check_out,
      price_per_unit: carListing.price_per_day,
      nights_or_days: carNightsOrDays,
      subtotal: carSubtotal,
    })
  }

  // Increment promo usage
  if (promoCodeId) {
    await supabase
      .from('promo_codes')
      .update({ uses_count: promoUsesCount + 1 })
      .eq('id', promoCodeId)
  }

  // Initiate Paystack payment
  const paystackKey = process.env.PAYSTACK_SECRET_KEY

  if (paystackKey) {
    // Always derive callback origin from the actual request, not NEXT_PUBLIC_APP_URL
    // (NEXT_PUBLIC_APP_URL may be localhost even in production deploys)
    const callbackOrigin = new URL(request.url).origin

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: totalAmount * 100, // kobo
        reference: booking.id,
        callback_url: `${callbackOrigin}/api/paystack/callback`,
        metadata: { booking_id: booking.id, listing_id: listing.id },
      }),
    })

    const paystackData = await paystackRes.json()

    console.log('Paystack init:', paystackData.status, paystackData.data?.reference)

    if (paystackData.status && paystackData.data?.authorization_url) {
      await supabase
        .from('bookings')
        .update({ paystack_reference: paystackData.data.reference })
        .eq('id', booking.id)

      return NextResponse.json({ payment_url: paystackData.data.authorization_url })
    }
  }

  return NextResponse.json({ booking_id: booking.id })
}
