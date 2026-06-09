import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HostSidebar from '@/components/HostSidebar'

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['host', 'admin'].includes(profile.role)) redirect('/')

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <HostSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
