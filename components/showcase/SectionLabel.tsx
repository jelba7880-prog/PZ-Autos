// Ink, not signal-red: a landing page has several of these labels in view
// together on a tall viewport, and red is budgeted for exactly one CTA per
// screen (plus the logo mark and, at most, one headline word) — a repeated
// section label would spend that budget many times over.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-text-muted mb-2">
      {children}
    </p>
  )
}
