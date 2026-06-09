import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ListingForm from '@/components/ListingForm'
import type { Listing } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: listing }, { data: hosts }] = await Promise.all([
    supabase.from('listings').select('*').eq('id', id).single(),
    supabase.from('users').select('id, full_name, email').in('role', ['host', 'admin']).order('full_name'),
  ])

  if (!listing) notFound()

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Edit listing</h1>
      <ListingForm hosts={hosts ?? []} initialData={listing as Listing} />
    </div>
  )
}
