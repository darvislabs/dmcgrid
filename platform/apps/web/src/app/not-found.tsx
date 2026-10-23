import Link from 'next/link';
import { Button, BrandLogo } from '@dmcgrid/ui';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-page)] text-[var(--text-primary)]">
      <BrandLogo size={48} />
      <h1 className="text-4xl font-bold font-display text-[var(--text-primary)] mt-6">404</h1>
      <p className="text-sm text-[var(--text-secondary)] mt-2 mb-6 max-w-sm">
        The requested travel portal page or brief could not be found.
      </p>
      <Link href="/login">
        <Button variant="primary" size="md">
          Return to Portal
        </Button>
      </Link>
    </div>
  );
}
