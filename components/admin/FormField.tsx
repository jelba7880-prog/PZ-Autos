export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-body text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
