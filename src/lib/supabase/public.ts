import { createClient } from '@supabase/supabase-js'

// Pure anon client — no session/cookie handling. Use this for public data
// fetches (listing browse, listing detail) so an expired or missing session
// cookie doesn't affect what unauthenticated visitors can see.
//
// NOTE: This still respects Supabase RLS. If your listings table has an anon
// SELECT policy (e.g. "FOR SELECT TO anon USING (is_active AND is_approved)")
// this will work correctly. If not, update your RLS in the Supabase dashboard.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
