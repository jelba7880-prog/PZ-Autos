import type { Metadata } from 'next'
import { PublicHeader } from '@/components/showcase/PublicHeader'
import { PublicCarGrid } from '@/components/showcase/PublicCarGrid'
import { getPublicCars } from '@/lib/showcase/queries'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Verified cars sourced from vetted dealerships and individuals across Lagos.',
}

export const revalidate = 0

export default async function CarsPage() {
  const cars = await getPublicCars()

  return (
    <>
      <PublicHeader />
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-10 md:py-14">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-signal-red mb-2">
          Inventory
        </p>
        <h1 className="font-display font-black text-3xl md:text-4xl text-ink mb-8">
          Every car currently on offer
        </h1>
        <PublicCarGrid cars={cars} />
      </div>
    </>
  )
}
