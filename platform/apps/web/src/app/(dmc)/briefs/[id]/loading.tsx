import React from 'react';
import { Card } from '@dmcgrid/ui';

export default function BriefDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-8 w-72 bg-[var(--border-subtle)] rounded" />
          <div className="h-3 w-96 bg-[var(--border-subtle)] rounded" />
        </div>
        <div className="h-10 w-32 bg-[var(--border-subtle)] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="h-5 w-48 bg-[var(--border-subtle)] rounded" />
          <div className="h-24 bg-[var(--border-subtle)]/50 rounded" />
        </Card>
        <Card className="p-6 space-y-4">
          <div className="h-5 w-32 bg-[var(--border-subtle)] rounded" />
          <div className="h-20 bg-[var(--border-subtle)]/50 rounded" />
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="h-6 w-56 bg-[var(--border-subtle)] rounded" />
        <div className="h-48 bg-[var(--border-subtle)]/50 rounded" />
      </Card>
    </div>
  );
}
