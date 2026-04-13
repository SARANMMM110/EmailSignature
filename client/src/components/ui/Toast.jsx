import { useEffect } from 'react';

export function Toast({ message, type = 'info', onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!duration || !onDismiss || !message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss, message]);

  if (!message) return null;

  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-800 text-white',
  };

  return (
    <div
      className={`toast-slide-in fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ${styles[type] || styles.info}`}
      role="status"
    >
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="rounded p-1 hover:bg-white/10"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
