import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import { RolesProvider } from '@/lib/RolesContext'
import ToastContainer from '@/app/components/ui/ToastContainer'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <RolesProvider>
              <ToastContainer>
                <div className="bg-token-bg text-token-text min-h-screen transition-colors duration-200">
                  {children}
                </div>
              </ToastContainer>
            </RolesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 