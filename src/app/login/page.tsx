'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'motion/react'

function LoginForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  async function signInWithGoogle() {
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (ref) callbackUrl.searchParams.set('ref', ref)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12"
      >
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#C8472A" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-2xl font-extrabold text-white tracking-tight">stayo</span>
        </div>

        <div>
          <p className="text-4xl font-extrabold text-white leading-tight mb-4">
            The best shortlets<br />and cars in Abuja.
          </p>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Browse verified properties and vehicles. Book in minutes, move in with confidence.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div>
            <p className="text-2xl font-extrabold text-white">500+</p>
            <p className="text-xs text-zinc-500 mt-0.5">Verified listings</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div>
            <p className="text-2xl font-extrabold text-white">10k+</p>
            <p className="text-xs text-zinc-500 mt-0.5">Happy guests</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div>
            <p className="text-2xl font-extrabold text-white">Abuja</p>
            <p className="text-xs text-zinc-500 mt-0.5">FCT, Nigeria</p>
          </div>
        </div>
      </motion.div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center bg-zinc-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#C8472A" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">stayo</span>
          </div>

          <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Welcome</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in to book shortlets and cars in Abuja</p>

          <motion.button
            onClick={signInWithGoogle}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-zinc-800 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-zinc-50 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {ref && (
            <p className="text-xs text-emerald-600 mt-4 font-semibold text-center">
              Referral code applied ✓
            </p>
          )}

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-10 pt-8 border-t border-zinc-200 grid grid-cols-3 gap-4 text-center"
          >
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                label: 'Verified hosts',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                label: 'Instant booking',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                label: 'Secure payments',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.22 + i * 0.07 }}
              >
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <p className="text-[11px] font-semibold text-zinc-700">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50" />}>
      <LoginForm />
    </Suspense>
  )
}
