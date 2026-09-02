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
  weight: ['400', '600'],
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${barlow.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
