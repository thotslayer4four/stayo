'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

const imgSlideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 70 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 70 }),
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [lightboxDir, setLightboxDir] = useState(1)
  const [carouselIdx, setCarouselIdx] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-zinc-100 flex items-center justify-center">
        <svg className="w-14 h-14 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  function openLightbox(i: number) {
    setLightboxIdx(i)
    setLightboxOpen(true)
  }

  function prevLightbox() {
    setLightboxDir(-1)
    setLightboxIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function nextLightbox() {
    setLightboxDir(1)
    setLightboxIdx((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  const sideImages = images.slice(1, 5)

  return (
    <>
      {/* ── Mobile: full-width carousel ── */}
      <div className="lg:hidden">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 relative group">
          <Image
            src={images[carouselIdx]}
            alt={`${title} — photo ${carouselIdx + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCarouselIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCarouselIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {carouselIdx + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Desktop: 1 + 4 Airbnb grid ── */}
      <div className="hidden lg:block">
        {images.length === 1 ? (
          <div
            className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <Image src={images[0]} alt={title} fill sizes="100vw" className="object-cover hover:scale-[1.02] transition-transform duration-500" />
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
              {/* Main big image */}
              <button
                onClick={() => openLightbox(0)}
                className="col-span-2 row-span-2 relative overflow-hidden group/img focus:outline-none"
                aria-label="View photo 1"
              >
                <Image
                  src={images[0]}
                  alt={`${title} — photo 1`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover/img:scale-[1.03] transition-transform duration-500 ease-out"
                />
              </button>

              {/* Side images */}
              {Array.from({ length: 4 }).map((_, i) => {
                const img = sideImages[i]
                return img ? (
                  <button
                    key={i}
                    onClick={() => openLightbox(i + 1)}
                    className="relative overflow-hidden group/img focus:outline-none"
                    aria-label={`View photo ${i + 2}`}
                  >
                    <Image
                      src={img}
                      alt={`${title} — photo ${i + 2}`}
                      fill
                      sizes="25vw"
                      className="object-cover group-hover/img:scale-[1.05] transition-transform duration-500 ease-out"
                    />
                  </button>
                ) : (
                  <div key={i} className="bg-zinc-100" />
                )
              })}
            </div>

            {/* Show all photos button */}
            <button
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Show all photos
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox modal ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') prevLightbox()
              if (e.key === 'ArrowRight') nextLightbox()
              if (e.key === 'Escape') setLightboxOpen(false)
            }}
            tabIndex={-1}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <span className="text-white/60 text-sm font-medium">
                {lightboxIdx + 1} / {images.length}
              </span>
              <motion.button
                onClick={() => setLightboxOpen(false)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Close"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Main image with directional slide */}
            <div className="flex-1 flex items-center justify-center px-16 min-h-0 relative" style={{ overflow: 'hidden' }}>
              <AnimatePresence mode="wait" custom={lightboxDir}>
                <motion.div
                  key={lightboxIdx}
                  custom={lightboxDir}
                  variants={imgSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[lightboxIdx]}
                    alt={`${title} — photo ${lightboxIdx + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain rounded-xl"
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={prevLightbox}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous photo"
                    className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={nextLightbox}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next photo"
                    className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex-shrink-0 px-6 pb-6 pt-4">
                <div className="flex gap-2 overflow-x-auto justify-center no-scrollbar">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setLightboxDir(i > lightboxIdx ? 1 : -1)
                        setLightboxIdx(i)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Photo ${i + 1}`}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        i === lightboxIdx
                          ? 'border-white opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
