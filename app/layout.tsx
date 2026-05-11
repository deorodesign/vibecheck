import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './context'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vybecheck | The Chaos Prediction Market',
  description: 'Stop trading boomer stocks. Bet on internet drama, timeline events, and pure chaos. Read the vybe, farm XP, and secure real USDC airdrops.',
  metadataBase: new URL('https://vybecheck.xyz'),
  openGraph: {
    title: 'Vybecheck | Bet on the Chaos',
    description: 'The internet is glitching. Trade virtual USDC on timeline disasters, farm Season XP, and take the bag. Are you fading the rumor or riding the vybe?',
    url: 'https://vybecheck.xyz',
    siteName: 'Vybecheck',
    images: [
      {
        url: 'https://vybecheck.xyz/og-image-v4.jpg', // TVRDÁ ZMĚNA NÁZVU SOUBORU
        width: 1200,
        height: 630,
        alt: 'Vybecheck Trading Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vybecheck | Bet on the Chaos',
    description: 'Stop trading boomer stocks. Bet on internet drama, farm XP, and secure real USDC airdrops. Are you fading the timeline or riding the vybe?',
    creator: '@vybecheck_xyz',
    images: ['https://vybecheck.xyz/og-image-v4.jpg'], // TVRDÁ ZMĚNA NÁZVU SOUBORU
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-white transition-colors duration-500`}>
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}