import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from './StatusBadge'
import { formatNGN, formatMileage, formatCarTitle, toDisplayCase } from '@/lib/formatters'
import type { PublicCarCardData } from '@/lib/showcase/types'

interface PublicCarCardProps {
  car: PublicCarCardData
}

export function PublicCarCard({ car }: PublicCarCardProps) {
  const title = formatCarTitle(car.make, car.model, car.year)
  const specLine = [toDisplayCase(car.transmission), toDisplayCase(car.fuel_type)]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group block rounded-xl border border-hairline bg-bg-base overflow-hidden"
    >
      <div className="relative aspect-[4/3] placeholder-stripes">
        {car.coverImageUrl ? (
          <Image
            src={car.coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-text-muted text-xs tracking-[0.3em]">
              PZ AUTOS
            </span>
          </div>
        )}
        {car.status !== 'available' && (
          <div className="absolute top-3 left-3">
            <StatusBadge status={car.status} />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-ink text-base leading-tight">{title}</h3>
        {specLine && (
          <p className="font-body text-xs text-text-muted mt-1">
            {formatMileage(car.mileage_km)} · {specLine}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-body font-semibold text-ink tabular-nums">
            {formatNGN(car.asking_price_ngn)}
          </span>
          {/* Ink, not signal-red: red is a one-per-screen accent (see the
              brand ratio constraint) and this link repeats on every card in
              a grid — using red here would blow that budget on any screen
              showing more than one car. */}
          <span className="font-body text-sm font-semibold text-ink group-hover:underline">
            Enquire →
          </span>
        </div>
      </div>
    </Link>
  )
}
