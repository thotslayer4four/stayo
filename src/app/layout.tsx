import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Stayo — Book Shortlets & Cars in Abuja',
  description: 'Find and book premium shortlets and car rentals in Abuja. Fast, simple, trusted.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
