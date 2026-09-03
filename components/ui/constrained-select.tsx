// A plain, uncontrolled <select> for the flat enum fields (fuel type,
// transmission, drivetrain, engine layout, body type). Uncontrolled
// because the dropdown-worthy set is fixed and small — no live filtering
// needed, unlike Make/Model.
//
// If the car's stored value isn't one of `options` (a pre-existing
// free-text value from before this form was constrained, e.g. body_type
// "SUV/Crossover"), it's injected as an extra selectable option labelled
// as a legacy value. That keeps it visible, selected, and submitted
// unchanged unless the admin deliberately picks something else — it is
// never silently dropped or overwritten.

interface ConstrainedSelectProps {
  name: string
  defaultValue?: string | null
  options: readonly string[]
  placeholder: string
  className?: string
}

export function ConstrainedSelect({ name, defaultValue, options, placeholder, className }: ConstrainedSelectProps) {
  const value = defaultValue ?? ''
  const isLegacyValue = value !== '' && !options.includes(value)

  return (
    <select
      name={name}
      defaultValue={value}
      className={className ?? 'w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink'}
    >
      <option value="">{placeholder}</option>
      {isLegacyValue && (
        <option value={value}>{value} (existing value — not in list)</option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
