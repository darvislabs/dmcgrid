import React from 'react';
import { Card, CardContent } from '@dmcgrid/ui';

export default function LedgerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-6 border-b border-[var(--border-line)] space-y-2">
        <div className="h-4 w-32 bg-[var(--bg-card)] rounded" />
        <div className="h-8 w-64 bg-[var(--bg-card)] rounded" />
        <div className="h-3 w-96 bg-[var(--bg-card)] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[var(--bg-card)] rounded-[12px] border border-[var(--border-line)]" />
        ))}
      </div>

      <Card className="bg-[var(--bg-card)] border-[var(--border-line)]">
        <CardContent className="p-6 space-y-4">
          <div className="h-10 bg-[var(--bg-page)] rounded-[9px]" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-[var(--bg-page)] rounded-[9px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
