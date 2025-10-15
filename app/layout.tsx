import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { NavigationLoader } from '@/components/navigation-loader'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://pubdev.app'),
  title: 'pubdev - Automated Publisher for Developers',
  description: 'The complete platform to automate your content publishing workflow. Transform your codebase into engaging content for X, LinkedIn, Facebook, Instagram, Reddit, and blogs.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
