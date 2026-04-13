const DEFAULT_LABEL_CLASS =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';

export function Input({ label, id, className = '', error, labelClassName, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelClassName ?? DEFAULT_LABEL_CLASS}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.22)] ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
