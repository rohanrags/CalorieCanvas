import type { Metadata } from 'next'
import './globals.css'
import { Fraunces } from 'next/font/google'
import { IBM_Plex_Sans } from 'next/font/google'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
})

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'CalorieCanvas',
  description: 'Private nutrition dashboard with Telegram logging and real-time sync.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
