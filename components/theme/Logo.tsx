import { cn } from '@/lib/utils'

// Inline-SVG recreation of the PZ Autos mark (three descending signal-red
// bars + "PZ") built from the brand kit images shared in chat. Those never
// landed as actual files in this environment (pasted inline, not uploaded),
// so this is a faithful stand-in — swap for the authoritative PNGs the
// moment they're available as real files, rather than trusting a
// hand-recreation to pixel-match forever.

interface MarkProps {
  className?: string
  tone?: 'dark' | 'light'
}

export function PZMark({ className, tone = 'dark' }: MarkProps) {
  const textColor = tone === 'dark' ? '#141414' : '#FFFFFF'
  return (
    <svg viewBox="0 0 120 60" className={cn('h-8 w-auto', className)} aria-hidden="true">
      <rect x="0" y="6" width="26" height="9" fill="#D0121B" />
      <rect x="9" y="24" width="17" height="9" fill="#D0121B" />
      <rect x="18" y="42" width="8" height="9" fill="#D0121B" />
      <text
        x="34"
        y="45"
        fontFamily="Archivo, Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="48"
        fill={textColor}
      >
        PZ
      </text>
    </svg>
  )
}

interface WordmarkProps {
  className?: string
  tone?: 'dark' | 'light'
}

export function Wordmark({ className, tone = 'dark' }: WordmarkProps) {
  const textColor = tone === 'dark' ? '#141414' : '#FFFFFF'
  const subColor = tone === 'dark' ? '#5B6470' : '#8B95A6'
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <PZMark tone={tone} className="h-7 shrink-0" />
      <div className="leading-none">
        <p
          className="font-display font-bold tracking-wide text-lg"
          style={{ color: textColor }}
        >
          PAZOGU
        </p>
        <p
          className="font-body font-semibold text-[9px] tracking-[0.3em]"
          style={{ color: subColor }}
        >
          AUTOMOBILES
        </p>
      </div>
    </div>
  )
}
