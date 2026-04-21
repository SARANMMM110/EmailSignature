import { HiOutlineXMark } from 'react-icons/hi2';

/** Remove control for stacked banner slots in the editor preview. */
export function PreviewDeleteButton({ title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="relative z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] sm:h-10 sm:w-10"
    >
      <HiOutlineXMark className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
