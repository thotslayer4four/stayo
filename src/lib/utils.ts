export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calcNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

export function calcHours(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60)))
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Parses datetime strings like "2024-06-10T09:00" without timezone assumptions
export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr.includes('T')) return formatDate(dateTimeStr)
  const [datePart, timePart] = dateTimeStr.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours] = timePart.split(':').map(Number)
  const h12 = hours % 12 || 12
  const ampm = hours < 12 ? 'AM' : 'PM'
  const dateLabel = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${dateLabel}, ${h12}:00 ${ampm}`
}
