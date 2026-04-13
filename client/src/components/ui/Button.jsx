export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
