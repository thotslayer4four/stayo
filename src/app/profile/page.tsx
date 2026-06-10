import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import CopyButton from '@/components/CopyButton'
import type { DbUser } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const p = profile as DbUser | null

  const initials = p?.full_name
    ? p.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  // Count referrals
  const { count: referralCount } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', user.id)

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar profile={p} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-28 md:pb-16">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">Your Profile</h1>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
            {p?.avatar_url ? (
              <Image src={p.avatar_url} alt="Avatar" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">{initials}</span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-900">{p?.full_name ?? 'Guest'}</p>
            <p className="text-sm text-zinc-500">{p?.email}</p>
            {p?.role && p.role !== 'guest' && (
              <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                p.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Referral code */}
          {p?.referral_code && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Referral code</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Share this and earn rewards when friends make their first booking
                  </p>
                </div>
                {referralCount !== null && referralCount > 0 && (
                  <span className="flex-shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                    {referralCount} referral{referralCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 text-base font-mono font-bold text-zinc-900 bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100 tracking-wider">
                  {p.referral_code}
                </code>
                <CopyButton value={p.referral_code} />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs text-zinc-400 bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-100 truncate font-mono">
                  {process.env.NEXT_PUBLIC_APP_URL}/login?ref={p.referral_code}
                </span>
                <CopyButton value={`${process.env.NEXT_PUBLIC_APP_URL}/login?ref=${p.referral_code}`} />
              </div>
            </div>
          )}

          {/* Account info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Sign-in method</span>
                <span className="font-medium text-zinc-900 capitalize">{p?.auth_provider ?? 'Google'}</span>
              </div>
              {p?.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">WhatsApp</span>
                  <span className="font-medium text-zinc-900">{p.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
            <Link href="/bookings" className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
              <span className="text-sm font-medium text-zinc-900">My bookings</span>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {p?.role === 'admin' && (
              <Link href="/admin" className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
                <span className="text-sm font-medium text-zinc-900">Admin panel</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
