import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './context'
import { Analytics } from '@vercel/analytics/react' // TADY IMPORTUJEME ANALYTIKU

const inter = Inter({ subsets: ['latin'] })

// TADY JE NASTAVENÍ PRO SOCIÁLNÍ SÍTĚ A VYHLEDÁVAČE
export const metadata: Metadata = {
  title: 'Vybecheck | The Cultural Prediction Market',
  description: 'Stop betting on boring charts. We bet on culture. Predict events, trade virtual USDC, and win real airdrops.',
  metadataBase: new URL('https://vybecheck.xyz'), // Tvoje reálná doména
  openGraph: {
    title: 'Vybecheck | Predict the Culture',
    description: 'Trade on pop culture, gaming, and crypto events. Play smart, level up your Season XP, and win real monthly airdrops.',
    url: 'https://vybecheck.xyz',
    siteName: 'Vybecheck',
    images: [
      {
        url: '/og-image.jpg', // Odkazuje na obrázek ve složce public/
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
    title: 'Vybecheck | Predict the Culture',
    description: 'Are you following the vybe or fading it? Trade virtual USDC and win real airdrops.',
    creator: '@vybecheck_xyz',
    images: ['/og-image.jpg'], // Odkazuje na obrázek ve složce public/
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
        {/* TADY SE SPUSTÍ SLEDOVÁNÍ NÁVŠTĚVNOSTI */}
        <Analytics />
      </body>
    </html>
  )
}