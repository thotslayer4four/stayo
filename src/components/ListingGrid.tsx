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

function MobileSection({ title, listings, showTitle }: { title: string; listings: Listing[]; showTitle: boolean }) {
  return (
    <div className={showTitle ? 'mb-8' : ''}>
      {showTitle && (
        <h2 className="text-base font-bold text-zinc-900 mb-4">{title}</h2>
      )}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-x-3 gap-y-6"
      >
        {listings.map((listing) => (
          <motion.div key={listing.id} variants={item}>
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
      {/* ── Mobile: 2-column vertical grid ── */}
      <div className="md:hidden">
        {showTwoSections ? (
          <>
            <MobileSection title="Shortlets in Abuja" listings={shortlets} showTitle />
            <MobileSection title="Cars in Abuja" listings={cars} showTitle />
          </>
        ) : (
          <MobileSection
            title={cars.length > 0 && shortlets.length === 0 ? 'Cars in Abuja' : 'Shortlets in Abuja'}
            listings={listings}
            showTitle={false}
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
