import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Navigation } from '@/components/ui'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  weight: ['400', '500', '700'],
  preload: false, // Don't block on font loading
  fallback: ['system-ui', 'arial'], // Fallback fonts while loading
})

export const metadata: Metadata = {
  title: 'Yukio - Your Japanese Language Tutor',
  description: 'AI-powered Japanese learning with personalized lessons and real-time conversation practice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans bg-bg-primary text-text-primary antialiased">
        <Navigation />
        <div className="min-h-screen">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#262626',
              color: '#FFFFFF',
              border: '1px solid #333333',
            },
          }}
        />
      </body>
    </html>
  )
}
