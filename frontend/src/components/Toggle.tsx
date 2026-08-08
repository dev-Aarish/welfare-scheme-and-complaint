export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
        checked ? 'bg-brand-mint' : 'bg-ink-400/30'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}
