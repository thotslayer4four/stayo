'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { DbUser } from '@/types'
import DateRangePicker from './DateRangePicker'

interface NavbarProps {
  profile: Pick<DbUser, 'full_name' | 'avatar_url' | 'role'> | null
  searchQuery?: string
  checkIn?: string
  checkOut?: string
  guests?: string
}

function shortDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ABUJA_DISTRICTS = [
  { name: 'Maitama', desc: 'Premium residential & embassy zone' },
  { name: 'Wuse 2', desc: 'Business, dining & nightlife hub' },
  { name: 'Asokoro', desc: 'Exclusive diplomatic district' },
  { name: 'Jabi', desc: 'Near Jabi Lake Mall' },
  { name: 'Garki', desc: 'Central government area' },
  { name: 'Gwarimpa', desc: 'Largest housing estate' },
  { name: 'Utako', desc: 'Vibrant commercial district' },
  { name: 'Life Camp', desc: 'Serene family neighbourhood' },
]

const panelVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
}

const panelTransition = { duration: 0.18, ease: 'easeOut' as const }

export default function Navbar({
  profile,
  searchQuery = '',
  checkIn = '',
  checkOut = '',
  guests = '',
}: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<'where' | 'when' | 'who' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const [localQ, setLocalQ] = useState(searchQuery)
  const [localCheckIn, setLocalCheckIn] = useState(checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(checkOut)
  const [localGuests, setLocalGuests] = useState(Number(guests) || 1)

  const today = new Date().toISOString().split('T')[0]
  const searchRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside search bar
  useEffect(() => {
    if (!activePanel) return
    function onDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [activePanel])

  const dateDisplay =
    localCheckIn && localCheckOut
      ? `${shortDate(localCheckIn)} – ${shortDate(localCheckOut)}`
      : localCheckIn
      ? shortDate(localCheckIn)
      : null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function submitSearch() {
    const p = new URLSearchParams()
    if (localQ) p.set('q', localQ)
    if (localCheckIn) p.set('check_in', localCheckIn)
    if (localCheckOut) p.set('check_out', localCheckOut)
    if (localGuests > 1) p.set('guests', String(localGuests))
    router.push(`/?${p.toString()}`)
    setActivePanel(null)
    setMobileOpen(false)
  }

  function pickDistrict(name: string) {
    setLocalQ(name)
    setActivePanel('when')
  }

  function toggle(panel: 'where' | 'when' | 'who') {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  const filteredDistricts = localQ
    ? ABUJA_DISTRICTS.filter(d => d.name.toLowerCase().includes(localQ.toLowerCase()))
    : ABUJA_DISTRICTS

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#C8472A" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">stayo</span>
          </Link>

          {/* ── Desktop inline search bar ── */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className={`flex items-stretch w-full h-14 rounded-full border transition-shadow ${activePanel ? 'border-zinc-300 shadow-lg' : 'border-zinc-200 shadow-md hover:shadow-lg'}`}>

              {/* WHERE */}
              <button
                onClick={() => toggle('where')}
                className={`flex flex-col justify-center px-5 rounded-l-full flex-1 text-left min-w-0 transition-colors ${activePanel === 'where' ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 leading-none mb-0.5">Where</span>
                <span className="text-sm font-semibold text-zinc-900 truncate">{localQ || 'Search destinations'}</span>
              </button>

              <div className="w-px bg-zinc-200 self-stretch my-3 flex-shrink-0" />

              {/* WHEN */}
              <button
                onClick={() => toggle('when')}
                className={`flex flex-col justify-center px-5 text-left flex-shrink-0 transition-colors ${activePanel === 'when' ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 leading-none mb-0.5">When</span>
                <span className={`text-sm font-semibold whitespace-nowrap ${dateDisplay ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {dateDisplay ?? 'Add dates'}
                </span>
              </button>

              <div className="w-px bg-zinc-200 self-stretch my-3 flex-shrink-0" />

              {/* WHO */}
              <button
                onClick={() => toggle('who')}
                className={`flex flex-col justify-center pl-5 pr-2 text-left flex-shrink-0 transition-colors ${activePanel === 'who' ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 leading-none mb-0.5">Who</span>
                <span className={`text-sm font-semibold whitespace-nowrap ${localGuests > 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {localGuests > 1 ? `${localGuests} guests` : 'Add guests'}
                </span>
              </button>

              {/* Search button */}
              <div className="flex items-center px-2">
                <button
                  onClick={submitSearch}
                  aria-label="Search"
                  className={`flex items-center justify-center rounded-full bg-brand hover:bg-brand-hover transition-all ${activePanel ? 'w-auto px-4 gap-2 h-10' : 'w-10 h-10'}`}
                >
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {activePanel && <span className="text-white text-sm font-bold whitespace-nowrap">Search</span>}
                </button>
              </div>
            </div>

            {/* ── WHERE panel ── */}
            <AnimatePresence>
              {activePanel === 'where' && (
                <motion.div
                  key="where-panel"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={panelTransition}
                  style={{ transformOrigin: 'top left' }}
                  className="absolute top-[calc(100%+10px)] left-0 w-[360px] bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden z-50"
                >
                  {/* Search input */}
                  <div className="px-5 pt-5 pb-3">
                    <input
                      type="text"
                      value={localQ}
                      onChange={(e) => setLocalQ(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                      placeholder="Search destinations…"
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                  </div>

                  {/* Suggested districts */}
                  <div className="px-3 pb-3">
                    <p className="px-2 pb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Suggested districts</p>
                    {filteredDistricts.map((d) => (
                      <button
                        key={d.name}
                        onClick={() => pickDistrict(d.name)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl hover:bg-zinc-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{d.name}</p>
                          <p className="text-xs text-zinc-500">{d.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── WHEN panel ── */}
            <AnimatePresence>
              {activePanel === 'when' && (
                <motion.div
                  key="when-panel"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={panelTransition}
                  style={{ transformOrigin: 'top center' }}
                  className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[700px] max-w-[98vw] bg-white rounded-3xl shadow-2xl border border-zinc-100 p-7 z-50"
                >
                  <DateRangePicker
                    checkIn={localCheckIn}
                    checkOut={localCheckOut}
                    onChange={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co) }}
                    minDate={today}
                  />
                  {(localCheckIn || localCheckOut) && (
                    <div className="mt-5 pt-5 border-t border-zinc-100 flex items-center justify-between">
                      <button
                        onClick={() => { setLocalCheckIn(''); setLocalCheckOut('') }}
                        className="text-sm font-semibold text-zinc-400 underline hover:text-zinc-700 transition-colors"
                      >
                        Clear dates
                      </button>
                      {localCheckIn && localCheckOut && (
                        <button
                          onClick={() => setActivePanel('who')}
                          className="text-sm font-bold text-brand hover:text-brand-hover transition-colors"
                        >
                          Next: add guests →
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── WHO panel ── */}
            <AnimatePresence>
              {activePanel === 'who' && (
                <motion.div
                  key="who-panel"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={panelTransition}
                  style={{ transformOrigin: 'top right' }}
                  className="absolute top-[calc(100%+10px)] right-0 w-72 bg-white rounded-3xl shadow-2xl border border-zinc-100 p-6 z-50"
                >
                  <p className="text-sm font-bold text-zinc-900 mb-4">How many guests?</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Guests</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Ages 2 and up</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLocalGuests(g => Math.max(1, g - 1))}
                        disabled={localGuests <= 1}
                        className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-700 transition-colors disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-zinc-900 w-5 text-center">{localGuests}</span>
                      <button
                        onClick={() => setLocalGuests(g => g + 1)}
                        className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mobile compact chip ── */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex-1 mx-2 flex items-center gap-3 h-12 rounded-full border border-zinc-200 shadow-sm px-4 hover:shadow-md transition-shadow text-left"
          >
            <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-zinc-900 block truncate">{localQ || 'Search destinations'}</span>
              {dateDisplay && <span className="text-xs text-zinc-400">{dateDisplay}</span>}
            </div>
          </button>

          {/* ── Right: host link + profile menu ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!profile && (
              <Link href="/login" className="hidden md:block text-sm font-semibold text-zinc-700 hover:bg-zinc-100 px-4 py-2.5 rounded-full transition-colors whitespace-nowrap">
                Become a host
              </Link>
            )}
            {profile && ['host', 'admin'].includes(profile.role) && (
              <Link
                href={profile.role === 'admin' ? '/admin' : '/host'}
                className="hidden md:block text-sm font-semibold text-zinc-700 hover:bg-zinc-100 px-4 py-2.5 rounded-full transition-colors whitespace-nowrap"
              >
                {profile.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
            )}

            {/* Profile button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open menu"
                className="flex items-center gap-2.5 border border-zinc-200 rounded-full py-2 pl-3 pr-2 hover:shadow-md transition-shadow ml-1"
              >
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url && !avatarError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <motion.div
                      key="menu-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <motion.div
                      key="menu-dropdown"
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                      style={{ transformOrigin: 'top right' }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-100 bg-white shadow-xl py-2 z-20"
                    >
                      {profile ? (
                        <>
                          <div className="px-4 py-3 border-b border-zinc-100">
                            <p className="text-sm font-bold text-zinc-900 truncate">{profile.full_name ?? 'Guest'}</p>
                            {profile.role !== 'guest' && <p className="text-xs text-zinc-400 mt-0.5 capitalize">{profile.role}</p>}
                          </div>
                          <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                            <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            Profile
                          </Link>
                          <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                            <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            My Bookings
                          </Link>
                          {profile.role === 'host' && (
                            <Link href="/host" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                              <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>
                              Host Dashboard
                            </Link>
                          )}
                          {profile.role === 'admin' && (
                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                              <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              Admin Panel
                            </Link>
                          )}
                          <div className="border-t border-zinc-100 mt-1 pt-1">
                            <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">Sign out</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-colors">Sign up</Link>
                          <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">Log in</Link>
                          <div className="border-t border-zinc-100 mt-1 pt-1">
                            <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">Become a host</Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile search overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            style={{ transformOrigin: 'top center' }}
            className="fixed top-4 left-4 right-4 z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden">
              <div className="p-5 space-y-4">
                {/* Where */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-2">Where</label>
                  <input
                    type="text"
                    value={localQ}
                    onChange={(e) => setLocalQ(e.target.value)}
                    placeholder="Search destinations…"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                  {localQ === '' && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {ABUJA_DISTRICTS.slice(0, 6).map(d => (
                        <button
                          key={d.name}
                          onClick={() => setLocalQ(d.name)}
                          className="text-left px-3 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
                        >
                          <p className="text-xs font-semibold text-zinc-900">{d.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* When */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-2">When</label>
                  <DateRangePicker
                    checkIn={localCheckIn}
                    checkOut={localCheckOut}
                    onChange={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co) }}
                    minDate={today}
                    singleMonth
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-2">Guests</label>
                  <div className="flex items-center justify-between border border-zinc-200 rounded-2xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-zinc-900">{localGuests} {localGuests === 1 ? 'guest' : 'guests'}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLocalGuests(g => Math.max(1, g - 1))} disabled={localGuests <= 1} className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-900 transition-colors disabled:opacity-30">−</button>
                      <span className="text-sm font-bold text-zinc-900 w-4 text-center">{localGuests}</span>
                      <button onClick={() => setLocalGuests(g => g + 1)} className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600 text-base hover:border-zinc-900 transition-colors">+</button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setLocalQ(''); setLocalCheckIn(''); setLocalCheckOut(''); setLocalGuests(1) }}
                    className="flex-1 py-3 rounded-2xl border border-zinc-200 text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={submitSearch}
                    className="flex-1 py-3 rounded-2xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
