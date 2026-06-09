'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

const TABS = [
  {
    label: 'Explore',
    href: '/',
    exact: true,
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-brand' : 'text-zinc-500'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: 'Saved',
    href: '/saved',
    exact: false,
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-brand' : 'text-zinc-500'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    href: '/bookings',
    exact: false,
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-brand' : 'text-zinc-500'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    exact: false,
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-brand' : 'text-zinc-500'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1"
            >
              <motion.span
                animate={isActive ? { scale: [0.85, 1.08, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="block"
              >
                {tab.icon(isActive)}
              </motion.span>
              <span
                className={`text-[10px] font-semibold transition-colors leading-none ${
                  isActive ? 'text-brand' : 'text-zinc-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
