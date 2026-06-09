import { createClient } from '@/lib/supabase/server'
import { getRecommendations } from '@/lib/ai'
import { NextResponse } from 'next/server'
import type { Listing } from '@/types'

export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const context = await request.json()

  // Fetch active listings for the AI to consider
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .eq('is_approved', true)

  if (!listings || listings.length === 0) {
    return NextResponse.json({ shortlet: null, car: null, reasoning: 'No listings available yet.' })
  }

  const result = await getRecommendations(context, listings as Listing[])

  // Log to ai_recommendations table
  await supabase.from('ai_recommendations').insert({
    guest_id: user.id,
    input_context: context,
    recommended_listings: [result.shortlet?.id, result.car?.id].filter(Boolean),
  })

  return NextResponse.json(result)
}
