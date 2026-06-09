import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ListingForm from '@/components/ListingForm'

export default async function NewHostListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/host/listings"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        My listings
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">New listing</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Your listing will be reviewed by the Stayo team before going live
        </p>
      </div>

      <div className="max-w-2xl">
        <ListingForm
          hosts={[{ id: user!.id, full_name: profile?.full_name ?? 'You' }]}
          defaultHostId={user!.id}
          submitEndpoint="/api/host/listings"
          successRedirect="/host/listings"
          hideHostSelector
        />
      </div>
    </div>
  )
}
