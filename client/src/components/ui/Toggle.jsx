export function Toggle({ label, checked, onChange, id, disabled }) {
  const tid = id || label?.replace(/\s/g, '-').toLowerCase();
  return (
    <label
      htmlFor={tid}
      className={`flex items-center gap-3 select-none ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={tid}
          type="checkbox"
          className="peer sr-only"
          disabled={disabled}
          checked={!!checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
        />
        <span
          className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"
          aria-hidden
        />
        <span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
          aria-hidden
        />
      </span>
      {label && (
        <span className="text-sm text-slate-700">{label}</span>
      )}
    </label>
  );
}
