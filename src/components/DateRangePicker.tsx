'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Props {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
  blockedDates?: string[]
  minDate?: string
  singleMonth?: boolean
  singleDateMode?: boolean
}

function toStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const calendarVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 36 }),
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  blockedDates = [],
  minDate,
  singleMonth = false,
  singleDateMode = false,
}: Props) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const effectiveMin = minDate ?? todayStr

  const [leftYear, setLeftYear] = useState(today.getFullYear())
  const [leftMonth, setLeftMonth] = useState(today.getMonth())
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)
  const [transitionKey, setTransitionKey] = useState(0)

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates])

  function prevMonth() {
    setDirection(-1)
    setTransitionKey(k => k - 1)
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1) }
    else setLeftMonth(m => m - 1)
  }

  function nextMonth() {
    setDirection(1)
    setTransitionKey(k => k + 1)
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1) }
    else setLeftMonth(m => m + 1)
  }

  function handleClick(dateStr: string) {
    if (dateStr < effectiveMin || blockedSet.has(dateStr)) return

    if (singleDateMode) {
      onChange(dateStr, dateStr)
      setHoverDate(null)
      return
    }

    if (!checkIn || (checkIn && checkOut)) {
      onChange(dateStr, '')
    } else if (dateStr <= checkIn) {
      onChange(dateStr, '')
    } else {
      const start = new Date(checkIn + 'T00:00:00')
      const end = new Date(dateStr + 'T00:00:00')
      for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        if (blockedSet.has(d.toISOString().split('T')[0])) {
          onChange(dateStr, '')
          return
        }
      }
      onChange(checkIn, dateStr)
    }
    setHoverDate(null)
  }

  function getPreviewEnd() {
    if (checkOut) return checkOut
    if (checkIn && !checkOut && hoverDate && hoverDate > checkIn) return hoverDate
    return null
  }

  function renderMonth(year: number, month: number, isLeft: boolean) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    const previewEnd = getPreviewEnd()

    return (
      <div className="w-[300px] flex-shrink-0">
        {/* Month header */}
        <div className="flex items-center justify-between mb-5">
          {isLeft ? (
            <motion.button
              onClick={prevMonth}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          ) : <div className="w-9" />}

          <span className="text-base font-bold text-zinc-900 tracking-tight">
            {MONTHS[month]} {year}
          </span>

          {(!isLeft || singleMonth) ? (
            <motion.button
              onClick={nextMonth}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
              aria-label="Next month"
            >
              <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ) : <div className="w-9" />}
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div
              key={d}
              className="h-9 flex items-center justify-center text-xs font-semibold text-zinc-400 select-none"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${year}-${month}-${i}`} className="h-11" />

            const dateStr = toStr(year, month, day)
            const isPast    = dateStr < effectiveMin
            const isBlocked = blockedSet.has(dateStr)
            const isStart   = dateStr === checkIn
            const isEnd     = dateStr === checkOut
            const isToday   = dateStr === todayStr
            const inRange   = !singleDateMode && !!(previewEnd && checkIn && dateStr > checkIn && dateStr < previewEnd)

            const showStrip  = !singleDateMode && (inRange || (isStart && !!previewEnd) || isEnd)
            const stripLeft  = isEnd   ? '0'   : isStart ? '50%' : '0'
            const stripRight = isStart ? '0'   : isEnd   ? '50%' : '0'

            let circleClass = 'relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm select-none transition-colors duration-100 '
            let numClass = ''

            if (isPast) {
              circleClass += 'cursor-default'
              numClass = 'text-zinc-300'
            } else if (isBlocked) {
              circleClass += 'cursor-not-allowed'
              numClass = 'text-zinc-300 line-through decoration-zinc-300'
            } else if (isStart || isEnd) {
              circleClass += 'bg-brand cursor-pointer'
              numClass = 'text-white font-bold'
            } else if (isToday) {
              circleClass += 'border-2 border-zinc-400 hover:bg-zinc-100 cursor-pointer'
              numClass = 'text-zinc-900 font-bold'
            } else {
              circleClass += 'hover:bg-zinc-100 cursor-pointer'
              numClass = 'text-zinc-800'
            }

            return (
              <div key={dateStr} className="relative h-11 flex items-center justify-center">
                {/* Range fill strip */}
                {showStrip && (
                  <div
                    className="absolute inset-y-0.5 bg-brand-light"
                    style={{ left: stripLeft, right: stripRight }}
                  />
                )}

                <motion.button
                  key={`${dateStr}-${isStart ? 's' : isEnd ? 'e' : 'n'}`}
                  onClick={() => handleClick(dateStr)}
                  onMouseEnter={() => {
                    if (checkIn && !checkOut && !isPast && !isBlocked) setHoverDate(dateStr)
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isPast || isBlocked}
                  aria-label={dateStr}
                  aria-pressed={isStart || isEnd}
                  whileTap={!isPast && !isBlocked ? { scale: 0.85 } : undefined}
                  initial={isStart || isEnd ? { scale: 0.6 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                  className={`${circleClass} ${numClass}`}
                >
                  {day}
                </motion.button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const calendarContent = singleMonth ? (
    renderMonth(leftYear, leftMonth, true)
  ) : (
    <div className="flex gap-8">
      {renderMonth(leftYear, leftMonth, true)}
      <div className="w-px bg-zinc-100 self-stretch flex-shrink-0" />
      {renderMonth(rightYear, rightMonth, false)}
    </div>
  )

  return (
    <div style={{ overflow: 'hidden' }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={transitionKey}
          custom={direction}
          variants={calendarVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {calendarContent}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
