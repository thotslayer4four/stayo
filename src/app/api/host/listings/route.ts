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

  const body = await request.json()
  const {
    title, description, type, city, address,
    price_per_night, price_per_day,
    max_guests, bedrooms, bathrooms, amenities, images,
    car_make, car_model, car_year, car_seats, car_transmission,
  } = body

  if (!title || !type || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await ctx.supabase.from('listings').insert({
    host_id: ctx.userId,
    title,
    description,
    type,
    city,
    address,
    price_per_night: type === 'shortlet' ? price_per_night : null,
    price_per_day: type === 'car' ? price_per_day : null,
    max_guests: type === 'shortlet' ? max_guests : null,
    bedrooms: type === 'shortlet' ? bedrooms : null,
    bathrooms: type === 'shortlet' ? bathrooms : null,
    amenities: amenities ?? [],
    images: images ?? [],
    car_make: type === 'car' ? car_make : null,
    car_model: type === 'car' ? car_model : null,
    car_year: type === 'car' ? car_year : null,
    car_seats: type === 'car' ? car_seats : null,
    car_transmission: type === 'car' ? car_transmission : null,
    is_active: false,
    is_approved: false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listing: data }, { status: 201 })
}
