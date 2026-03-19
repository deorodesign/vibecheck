import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './context'

const inter = Inter({ subsets: ['latin'] })

// TADY JE NASTAVENÍ PRO SOCIÁLNÍ SÍTĚ A VYHLEDÁVAČE
export const metadata: Metadata = {
  title: 'Vybecheck | The Cultural Prediction Market',
  description: 'Predict culture, trade virtual USDC, and win real airdrops. Are you following the vybe or fading it?',
  metadataBase: new URL('https://vybecheck.com'), // V budoucnu nahraď svou reálnou doménou
  openGraph: {
    title: 'Vybecheck | Predict the Culture',
    description: 'Trade on pop culture, gaming, and crypto events. Play smart, level up your Season XP, and win real monthly airdrops.',
    url: 'https://vybecheck.com',
    siteName: 'Vybecheck',
    images: [
      {
        // Až budeš mít vlastní reklamní banner (ideálně 1200x630px), nahraď tento link:
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&auto=format&fit=crop', 
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
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&auto=format&fit=crop'],
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
      </body>
    </html>
  )
}