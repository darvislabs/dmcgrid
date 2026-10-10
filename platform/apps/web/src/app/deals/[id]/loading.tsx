import React from 'react';
import { Card } from '@dmcgrid/ui';

export default function DealDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
        <div className="h-4 w-32 bg-[var(--border-subtle)] rounded" />
        <div className="h-5 w-24 bg-[var(--border-subtle)] rounded" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[var(--border-subtle)] rounded" />
          <div className="h-8 w-72 bg-[var(--border-subtle)] rounded" />
          <div className="h-3 w-56 bg-[var(--border-subtle)] rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-10 w-28 bg-[var(--border-subtle)] rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="h-3 w-20 bg-[var(--border-subtle)] rounded" />
            <div className="h-7 w-28 bg-[var(--border-subtle)] rounded" />
            <div className="h-3 w-32 bg-[var(--border-subtle)] rounded" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="h-6 w-48 bg-[var(--border-subtle)] rounded" />
            <div className="h-32 bg-[var(--border-subtle)]/40 rounded" />
          </Card>
          <Card className="p-6 space-y-4">
            <div className="h-6 w-48 bg-[var(--border-subtle)] rounded" />
            <div className="h-40 bg-[var(--border-subtle)]/40 rounded" />
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="h-6 w-36 bg-[var(--border-subtle)] rounded" />
            <div className="h-28 bg-[var(--border-subtle)]/40 rounded" />
          </Card>
          <Card className="p-6 space-y-4">
            <div className="h-6 w-36 bg-[var(--border-subtle)] rounded" />
            <div className="h-28 bg-[var(--border-subtle)]/40 rounded" />
          </Card>
        </div>
      </div>
    </div>
  );
}
