/** Floating help / contact button — matches premium SaaS patterns */
export function SupportFab() {
  return (
    <a
      href="mailto:hello@signaturebuilder.io?subject=Support"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-blue-600/40 transition duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      style={{
        background: 'linear-gradient(145deg, #3b5fff 0%, #2563eb 50%, #1d4ed8 100%)',
      }}
      title="Contact support"
      aria-label="Contact support"
    >
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </a>
  );
}
