import type { Metadata } from 'next'
import { Archivo, Barlow } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  // 300 is used only by MakeTypography's brand-wordmark styling in
  // MakesTicker — the site's default body copy stays 400/600.
  weight: ['300', '400', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Pazogu Automobiles',
    template: '%s · Pazogu Automobiles',
  },
  description:
    'Verified cars sourced from vetted dealerships and individuals across Lagos — direct WhatsApp access to the owner.',
  icons: {
    // No media query = default/fallback, also matches light mode explicitly.
    // Dark-mode browsers (tab bar, bookmarks, PWA icon) get the dark-bg mark
    // instead so it doesn't sit as a stray white square in dark chrome.
    icon: [
      { url: '/icon-512.png', type: 'image/png' },
      {
        url: '/icon-512-dark.png',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${barlow.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
