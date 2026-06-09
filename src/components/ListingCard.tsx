'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { formatNaira } from '@/lib/utils'
import type { Listing } from '@/types'

export default function ListingCard({ listing }: { listing: Listing }) {
  const isShortlet = listing.type === 'shortlet'
  const price = isShortlet ? listing.price_per_night : listing.price_per_day
  const priceUnit = isShortlet ? 'night' : 'day'
  const images = listing.images ?? []
  const [imgIdx, setImgIdx] = useState(0)
  const [liked, setLiked] = useState(false)

  const visibleDots = Math.min(images.length, 5)

  function prevImg(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function nextImg(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  function goToImg(e: React.MouseEvent, i: number) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx(i)
  }

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLiked((v) => !v)
  }

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3">
        <AnimatePresence mode="sync" initial={false}>
          {images[imgIdx] ? (
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <Image
                src={images[imgIdx]}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              {isShortlet ? (
                <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heart / wishlist */}
        <motion.button
          onClick={toggleLike}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-3 right-3 z-10"
        >
          <motion.span
            key={liked ? 'liked' : 'not'}
            initial={{ scale: 0.65 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 16 }}
            className="block"
          >
            <svg
              className="w-6 h-6 drop-shadow-sm"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              {liked ? (
                <path
                  fill="#C8472A"
                  d="M16 28c7-4.733 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.267 14 17z"
                />
              ) : (
                <>
                  <path
                    fill="rgba(0,0,0,0.4)"
                    d="M16 28c7-4.733 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.267 14 17z"
                  />
                  <path
                    fill="white"
                    fillOpacity="0.85"
                    d="M16 26.18C9.87 21.87 3.5 17.02 3.5 11A5.48 5.48 0 0 1 9 5.5c1.41 0 2.84.55 3.9 1.6L16 10.17l3.1-3.07A5.5 5.5 0 0 1 28.5 11c0 6.02-6.37 10.87-12.5 15.18z"
                  />
                </>
              )}
            </svg>
          </motion.span>
        </motion.button>

        {/* Prev / next arrows — visible on hover */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={prevImg}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <svg className="w-3.5 h-3.5 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={nextImg}
              whileTap={{ scale: 0.9 }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <svg className="w-3.5 h-3.5 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}

        {/* Dot pagination — visible on hover */}
        {visibleDots > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {Array.from({ length: visibleDots }).map((_, i) => (
              <motion.button
                key={i}
                onClick={(e) => goToImg(e, i)}
                animate={i === imgIdx
                  ? { scale: 1.25, opacity: 1 }
                  : { scale: 1, opacity: 0.6 }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label={`Photo ${i + 1}`}
                className="w-1.5 h-1.5 rounded-full bg-white"
              />
            ))}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="px-0.5">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-1">
            {listing.title}
          </p>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-zinc-800 flex-shrink-0 mt-px">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            New
          </span>
        </div>
        <p className="text-sm text-zinc-500 leading-snug">
          {listing.location || listing.city}
          {isShortlet && listing.max_guests ? ` · up to ${listing.max_guests} guests` : ''}
          {!isShortlet && listing.car_make ? ` · ${[listing.car_make, listing.car_model].filter(Boolean).join(' ')}` : ''}
        </p>
        <p className="text-sm text-zinc-900 mt-1.5">
          <span className="font-semibold">{price != null ? formatNaira(price) : '—'}</span>
          <span className="text-zinc-500 font-normal"> / {priceUnit}</span>
        </p>
      </div>
    </Link>
  )
}
