export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-surface-muted" />
        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <div className="h-6 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-surface-muted" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-4">
            <div className="h-6 w-10 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
