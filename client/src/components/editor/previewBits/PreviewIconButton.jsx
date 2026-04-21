/**
 * Compact icon-only control for editor preview chrome (information, palettes, layouts).
 */
export function PreviewIconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800 active:scale-[0.98] sm:h-10 sm:w-10"
    >
      {children}
    </button>
  );
}
