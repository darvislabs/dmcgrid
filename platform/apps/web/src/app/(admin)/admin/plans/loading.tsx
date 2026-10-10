import React from 'react';


export default function PlansLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-6 border-b border-[var(--border-line)] space-y-2">
        <div className="h-4 w-32 bg-[var(--bg-card)] rounded" />
        <div className="h-8 w-64 bg-[var(--bg-card)] rounded" />
        <div className="h-3 w-96 bg-[var(--bg-card)] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-line)]" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-line)]" />
        ))}
      </div>
    </div>
  );
}
