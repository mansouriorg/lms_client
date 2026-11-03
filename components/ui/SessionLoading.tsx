// Shown by the /student and /center layouts while the sign-in is checked,
// and while a signed-out visitor is sent to the sign-in page.
export default function SessionLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen bg-[#0f172a] font-sans flex items-center justify-center"
    >
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-indigo-400 animate-spin"
        />
        Checking your sign-in...
      </div>
    </div>
  );
}
