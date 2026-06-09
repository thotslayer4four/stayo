import { createClient } from '@/lib/supabase/server'
import ListingForm from '@/components/ListingForm'

export default async function NewListingPage() {
  const supabase = await createClient()

  const { data: hosts } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('role', ['host', 'admin'])
    .order('full_name')

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Create listing</h1>
      <ListingForm hosts={hosts ?? []} />
    </div>
  )
}
