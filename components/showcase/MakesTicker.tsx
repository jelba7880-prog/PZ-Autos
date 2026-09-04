import { getMakeTypography } from '@/lib/showcase/makeTypography'

// Renders the dealership's permanent brand list (CAR_MAKES — the same
// source the admin Make field offers, see app/page.tsx) as a looping
// horizontal ticker. This is a standing showcase, not an inventory
// snapshot, so it's always long enough to loop — no sparse-list fallback
// needed, just a guard against an empty source list.
const MIN_SET_LENGTH = 8
const SECONDS_PER_ITEM = 3.5
const MIN_DURATION_S = 12
const MAX_DURATION_S = 60

export function MakesTicker({ makes }: { makes: string[] }) {
  if (makes.length === 0) return null

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
        <MakeLabel key={`${make}-${index}`} make={make} />
      ))}
    </div>
  )
}

// Sized well above the section label (text-[11px]) and body copy
// (text-sm) so this reads as a distinct showcase tier — but staying
// under the h2 scale (text-2xl/3xl) used elsewhere on the page, so it
// stays a supporting section rather than competing with real headings.
//
// Recognized makes render with wordmark-evoking styling (see
// lib/showcase/makeTypography.ts); anything else — including free-typed
// custom makes — falls through to the site's normal default type, just
// sized to match the row it sits in.
function MakeLabel({ make }: { make: string }) {
  const style = getMakeTypography(make)

  if (!style) {
    return <span className="font-body text-lg md:text-xl font-semibold text-ink">{make}</span>
  }

  return (
    <span
      className="text-lg md:text-xl text-ink"
      style={{
        fontFamily: style.fontFamily === 'archivo' ? 'var(--font-archivo)' : 'var(--font-barlow)',
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        fontStyle: style.fontStyle,
      }}
    >
      {make}
    </span>
  )
}
