import Anthropic from '@anthropic-ai/sdk'
import type { Listing } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface RecommendationContext {
  purpose: 'business' | 'leisure' | 'student'
  groupSize: number
  budget: number
  checkIn: string
  checkOut: string
}

interface RecommendationResult {
  shortlet: Listing | null
  car: Listing | null
  reasoning: string
}

export async function getRecommendations(
  context: RecommendationContext,
  listings: Listing[]
): Promise<RecommendationResult> {
  const shortlets = listings.filter((l) => l.type === 'shortlet')
  const cars = listings.filter((l) => l.type === 'car')

  const prompt = `You are a concierge for Stayo, a premium shortlet and car rental platform in Abuja, Nigeria.

Guest context:
- Purpose: ${context.purpose}
- Group size: ${context.groupSize} people
- Budget: ₦${context.budget.toLocaleString()} total
- Stay: ${context.checkIn} to ${context.checkOut}

Available shortlets:
${shortlets.map((l) => `[${l.id}] ${l.title} — ${l.city}, ₦${l.price_per_night?.toLocaleString()}/night, max ${l.max_guests} guests. Amenities: ${l.amenities?.join(', ')}`).join('\n') || 'None available'}

Available cars:
${cars.map((l) => `[${l.id}] ${l.car_make} ${l.car_model} ${l.car_year} — ${l.city}, ₦${l.price_per_day?.toLocaleString()}/day`).join('\n') || 'None available'}

Recommend the single best shortlet and car (or null if none fit). Respond in JSON:
{"shortlet_id": "uuid or null", "car_id": "uuid or null", "reasoning": "one short sentence explaining the combo"}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{}')

    return {
      shortlet: shortlets.find((l) => l.id === parsed.shortlet_id) ?? null,
      car: cars.find((l) => l.id === parsed.car_id) ?? null,
      reasoning: parsed.reasoning ?? '',
    }
  } catch {
    return { shortlet: null, car: null, reasoning: '' }
  }
}
