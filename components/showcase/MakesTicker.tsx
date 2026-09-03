// Renders the distinct makes currently in stock (see getActiveMakes) as a
// looping horizontal ticker. Below MIN_MAKES_TO_LOOP a loop reads as
// pointless (a single word repeating past itself), so we fall back to a
// static wrapped row instead of animating.
const MIN_MAKES_TO_LOOP = 2
const MIN_SET_LENGTH = 8
const SECONDS_PER_ITEM = 3.5
const MIN_DURATION_S = 12
const MAX_DURATION_S = 60

export function MakesTicker({ makes }: { makes: string[] }) {
  if (makes.length === 0) return null

  if (makes.length < MIN_MAKES_TO_LOOP) {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {makes.map((make) => (
          <span key={make} className="font-body text-sm font-semibold text-ink">
            {make}
          </span>
        ))}
      </div>
    )
  }

  // Repeat the source list until the set is wide enough that duplicating it
  // for the loop doesn't leave visible gaps at low make counts.
  const repeatCount = Math.max(1, Math.ceil(MIN_SET_LENGTH / makes.length))
  const displaySet = Array.from({ length: repeatCount }, () => makes).flat()
  const duration = Math.min(
    MAX_DURATION_S,
    Math.max(MIN_DURATION_S, displaySet.length * SECONDS_PER_ITEM)
  )

  return (
    <div
      className="makes-ticker-viewport"
      style={{ '--makes-ticker-duration': `${duration}s` } as React.CSSProperties}
    >
      <div className="makes-ticker-track">
        <MakesSet makes={displaySet} />
        <MakesSet makes={displaySet} ariaHidden />
      </div>
    </div>
  )
}

function MakesSet({ makes, ariaHidden }: { makes: string[]; ariaHidden?: boolean }) {
  return (
    <div className="makes-ticker-set" aria-hidden={ariaHidden} data-ticker-dup={ariaHidden}>
      {makes.map((make, index) => (
        <span key={`${make}-${index}`} className="font-body text-sm font-semibold text-ink">
          {make}
        </span>
      ))}
    </div>
  )
}
