import Link from 'next/link'
import { Wordmark } from '@/components/theme/Logo'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="bg-ink">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin">
              <Wordmark tone="light" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 font-body text-sm">
              <Link href="/admin" className="text-text-on-dark hover:text-white transition-colors">
                Inventory
              </Link>
              <Link
                href="/admin/inventory/new"
                className="text-text-on-dark hover:text-white transition-colors"
              >
                Add car
              </Link>
              <Link
                href="/admin/archive"
                className="text-text-on-dark hover:text-white transition-colors"
              >
                Archive
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 md:px-8 py-8">{children}</main>
    </div>
  )
}
