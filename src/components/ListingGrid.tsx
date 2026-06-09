'use client'

import { motion, type Variants } from 'motion/react'
import ListingCard from './ListingCard'
import type { Listing } from '@/types'

interface Props {
  listings: Listing[]
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
}

const mobileItem: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32 } },
}

function MobileSection({ title, listings }: { title: string; listings: Listing[] }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">{title}</h2>
        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar"
      >
        {listings.map((listing) => (
          <motion.div key={listing.id} variants={mobileItem} className="w-[185px] flex-shrink-0">
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4"
        >
          <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.div>
        <h3 className="text-base font-semibold text-zinc-900 mb-1">No listings found</h3>
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </motion.div>
    )
  }

  const shortlets = listings.filter((l) => l.type === 'shortlet')
  const cars = listings.filter((l) => l.type === 'car')
  const showTwoSections = shortlets.length > 0 && cars.length > 0

  return (
    <>
      {/* ── Mobile: horizontal scroll sections ── */}
      <div className="md:hidden -mx-4">
        {showTwoSections ? (
          <>
            <MobileSection title="Shortlets in Abuja" listings={shortlets} />
            <MobileSection title="Cars in Abuja" listings={cars} />
          </>
        ) : (
          <MobileSection
            title={cars.length > 0 && shortlets.length === 0 ? 'Cars in Abuja' : 'Shortlets in Abuja'}
            listings={listings}
          />
        )}
      </div>

      {/* ── Desktop: staggered grid ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
      >
        {listings.map((listing) => (
          <motion.div key={listing.id} variants={item}>
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}
