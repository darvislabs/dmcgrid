import React from 'react';
import { Card } from '@dmcgrid/ui';

export default function RfqLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-8 w-64 bg-[var(--border-subtle)] rounded" />
          <div className="h-3 w-80 bg-[var(--border-subtle)] rounded" />
        </div>
        <div className="h-10 w-36 bg-[var(--border-subtle)] rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="h-3 w-20 bg-[var(--border-subtle)] rounded" />
            <div className="h-7 w-24 bg-[var(--border-subtle)] rounded" />
            <div className="h-3 w-32 bg-[var(--border-subtle)] rounded" />
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="h-4 w-40 bg-[var(--border-subtle)] rounded" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[var(--border-subtle)]/50 rounded" />
          ))}
        </div>
      </Card>
    </div>
  );
}
