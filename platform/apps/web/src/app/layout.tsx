import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DMCGrid — Travel Commerce Infrastructure',
  description: 'The operating network for modern B2B travel sourcing. Connecting travel agents and destination management companies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('dmc-theme');
                if (saved === 'light' || saved === 'dark') {
                  document.documentElement.dataset.theme = saved;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
