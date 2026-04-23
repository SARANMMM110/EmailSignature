import { useEffect } from 'react';
import { Button } from './Button.jsx';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  /** @type {'light' | 'dark'} */
  tone = 'light',
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const panel =
    tone === 'dark'
      ? 'rounded-xl bg-slate-900 shadow-xl ring-1 ring-slate-600/80'
      : 'rounded-xl bg-white shadow-xl ring-1 ring-slate-200';
  const headerBorder = tone === 'dark' ? 'border-slate-600' : 'border-slate-100';
  const titleCls = tone === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const footerBorder = tone === 'dark' ? 'border-slate-600' : 'border-slate-100';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`.trim()}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[min(90vh,900px)] w-full flex-col ${widths[size] || widths.md} ${panel}`}
      >
        <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${headerBorder}`}>
          <h2 className={`text-lg font-semibold ${titleCls}`}>{title}</h2>
          <Button
            variant="ghost"
            className={tone === 'dark' ? '!p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100' : '!p-2'}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className={`shrink-0 border-t px-5 py-4 ${footerBorder}`}>{footer}</div> : null}
      </div>
    </div>
  );
}
