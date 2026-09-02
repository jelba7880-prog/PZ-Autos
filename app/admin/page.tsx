import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StaleIndicator } from '@/components/admin/StaleIndicator'
import { formatNGN, formatCarTitle } from '@/lib/formatters'
import { setCarFeatured, moveFeaturedUp, moveFeaturedDown, markVerified } from './actions'
import type { CarWithSupplier } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const supabase = await createClient()

  const { data: cars, error } = await supabase
    .from('cars')
    .select('*, supplier:suppliers(id, name, supplier_type)')
    .in('status', ['draft', 'available', 'reserved'])
    .order('is_featured', { ascending: false })
    .order('featured_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error

  const typedCars = (cars ?? []) as unknown as CarWithSupplier[]
  const featuredCount = typedCars.filter((c) => c.is_featured).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Inventory</h1>
        <Link
          href="/admin/inventory/new"
          className="rounded-lg bg-signal-red text-white font-body font-semibold text-sm px-4 py-2"
        >
          Add car
        </Link>
      </div>

      {featuredCount > 6 && (
        <p className="font-body text-sm text-signal-red mb-4">
          {featuredCount} cars are featured — only the first 6 by order will show on the landing
          page. Unfeature {featuredCount - 6} more.
        </p>
      )}

      <div className="border border-hairline rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-placeholder-b">
            <tr>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Car
              </th>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Supplier
              </th>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Status
              </th>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Price
              </th>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Verified
              </th>
              <th className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted px-4 py-3">
                Featured
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {typedCars.map((car) => (
              <tr key={car.id}>
                <td className="px-4 py-3 font-body text-sm text-ink font-semibold">
                  {formatCarTitle(car.make, car.model, car.year)}
                </td>
                <td className="px-4 py-3 font-body text-sm text-text-muted">
                  {car.supplier?.name ?? '—'}
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink capitalize">{car.status}</td>
                <td className="px-4 py-3 font-body text-sm text-ink tabular-nums">
                  {formatNGN(car.asking_price_ngn)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StaleIndicator lastVerifiedAt={car.last_verified_at} />
                    <form action={markVerified.bind(null, car.id)}>
                      <button
                        type="submit"
                        className="font-body text-xs text-text-muted hover:text-ink underline"
                      >
                        Mark verified
                      </button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <form action={setCarFeatured.bind(null, car.id, !car.is_featured)}>
                      <button
                        type="submit"
                        disabled={!car.is_featured && !['available', 'reserved'].includes(car.status)}
                        className="font-body text-xs font-semibold text-ink underline disabled:opacity-40 disabled:no-underline"
                      >
                        {car.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </form>
                    {car.is_featured && (
                      <>
                        <form action={moveFeaturedUp.bind(null, car.id)}>
                          <button type="submit" aria-label="Move up" className="text-text-muted hover:text-ink">
                            ↑
                          </button>
                        </form>
                        <form action={moveFeaturedDown.bind(null, car.id)}>
                          <button type="submit" aria-label="Move down" className="text-text-muted hover:text-ink">
                            ↓
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/inventory/${car.id}/edit`}
                    className="font-body text-sm font-semibold text-ink hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {typedCars.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-text-muted">
                  No cars yet.{' '}
                  <Link href="/admin/inventory/new" className="underline">
                    Add your first one
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
