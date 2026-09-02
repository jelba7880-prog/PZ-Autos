import { PublicCarCard } from './PublicCarCard'
import type { PublicCarCardData } from '@/lib/showcase/types'

interface PublicCarGridProps {
  cars: PublicCarCardData[]
  emptyMessage?: string
}

export function PublicCarGrid({ cars, emptyMessage = 'No cars listed right now.' }: PublicCarGridProps) {
  if (cars.length === 0) {
    return <p className="font-body text-text-muted py-12 text-center">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {cars.map((car) => (
        <PublicCarCard key={car.id} car={car} />
      ))}
    </div>
  )
}
