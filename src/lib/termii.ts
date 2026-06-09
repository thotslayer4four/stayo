const TERMII_URL = 'https://api.ng.termii.com/api/sms/send'

interface SendWhatsAppParams {
  to: string
  message: string
}

export async function sendWhatsApp({ to, message }: SendWhatsAppParams) {
  const key = process.env.TERMII_API_KEY
  if (!key) return

  await fetch(TERMII_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      to,
      from: 'Stayo',
      sms: message,
      type: 'plain',
      channel: 'whatsapp',
    }),
  })
}

export function bookingConfirmedMessage({
  guestName,
  listingTitle,
  checkIn,
  checkOut,
  total,
  bookingId,
}: {
  guestName: string
  listingTitle: string
  checkIn: string
  checkOut: string
  total: number
  bookingId: string
}) {
  return `Hi ${guestName}! Your Stayo booking is confirmed 🎉

*${listingTitle}*
Check-in: ${checkIn}
Check-out: ${checkOut}
Total paid: ₦${total.toLocaleString()}
Ref: ${bookingId.slice(0, 8).toUpperCase()}

Need help? Reply to this message.`
}
