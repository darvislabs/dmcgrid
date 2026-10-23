import React from 'react';
import { Card } from '@dmcgrid/ui';

export default function TravelerShareLoading() {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)] animate-pulse">
      <header className="border-b border-[var(--border-line)] bg-[var(--bg-card)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="h-6 w-32 bg-[var(--border-subtle)] rounded" />
          <div className="h-8 w-24 bg-[var(--border-subtle)] rounded" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-10 w-96 bg-[var(--border-subtle)] rounded" />
          <div className="h-4 w-80 bg-[var(--border-subtle)] rounded" />
        </div>

        <div className="h-28 bg-[var(--border-subtle)]/40 rounded-[12px]" />

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="h-4 w-40 bg-[var(--border-subtle)] rounded" />
              <div className="h-12 bg-[var(--border-subtle)]/40 rounded" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
