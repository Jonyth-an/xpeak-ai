import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Xpeak AI - Your Smartest Way to Begin a Language Adventure',
  description: 'Next-gen language learning. Powered by AI. Guided by Real Coaches. Inspired by You.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="bg-[#f9fafb] text-token-text">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 