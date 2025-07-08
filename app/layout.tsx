import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import { DesktopNav } from './components/DesktopNav'
import { MobileBottomNav } from './components/MobileBottomNav'
import Link from 'next/link'
import { Home, User } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Xpeak AI - Your Smartest Way to Begin a Language Adventure',
  description: 'Next-gen language learning. Powered by AI. Guided by Real Coaches. Inspired by You.',
}

function MobileHeader() {
  return (
    <header className="flex md:hidden fixed top-0 left-0 w-full h-14 bg-white z-50 border-b items-center px-4 justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <Home className="w-6 h-6" /> Xpeak
      </Link>
      <Link href="/login" className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
        <User className="w-5 h-5" />
        <span className="text-sm">Login</span>
      </Link>
    </header>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <DesktopNav />
            <MobileHeader />
            <div className="bg-token-bg text-token-text min-h-screen transition-colors duration-200 pt-14 md:pt-16 pb-16 md:pb-0">
              {children}
            </div>
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 