import React from 'react';
import { Card } from '@dmcgrid/ui';

export default function ProposalDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
        <div className="h-4 w-32 bg-[var(--border-subtle)] rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-[var(--border-subtle)] rounded" />
          <div className="h-8 w-24 bg-[var(--border-subtle)] rounded" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-8 sm:p-12 space-y-8">
          <div className="flex justify-between items-start pb-6 border-b border-[var(--border-subtle)]">
            <div className="space-y-2">
              <div className="h-3 w-40 bg-[var(--border-subtle)] rounded" />
              <div className="h-6 w-56 bg-[var(--border-subtle)] rounded" />
            </div>
            <div className="h-4 w-32 bg-[var(--border-subtle)] rounded" />
          </div>

          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-[var(--border-subtle)] rounded" />
            <div className="h-4 w-48 bg-[var(--border-subtle)] rounded" />
            <div className="h-14 bg-[var(--border-subtle)]/40 rounded" />
          </div>

          <div className="space-y-4 pt-4">
            <div className="h-5 w-40 bg-[var(--border-subtle)] rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-[12px] border border-[var(--border-subtle)] space-y-3">
                <div className="h-4 w-48 bg-[var(--border-subtle)] rounded" />
                <div className="h-10 bg-[var(--border-subtle)]/40 rounded" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
