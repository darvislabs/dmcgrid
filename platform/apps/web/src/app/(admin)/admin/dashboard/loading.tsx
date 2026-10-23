export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 bg-[var(--bg-surface)] rounded-[9px]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-[var(--bg-surface)] rounded-[12px]" />
        ))}
      </div>
      <div className="h-64 bg-[var(--bg-surface)] rounded-[12px]" />
    </div>
  );
}
