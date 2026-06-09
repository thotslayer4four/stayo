import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// Redirect legacy /host/availability/[id] to the unified availability page
export default async function ListingAvailabilityRedirect({ params }: PageProps) {
  const { id } = await params
  redirect(`/host/availability?listing=${id}`)
}
