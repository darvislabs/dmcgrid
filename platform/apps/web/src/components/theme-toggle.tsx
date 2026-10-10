'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dmc-theme') as 'dark' | 'light' | null;
    const initial = saved || (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark';
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('dmc-theme', next);
    } catch {
      // storage unavailable
    }
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-[6px] border border-[var(--border-line)] bg-[var(--bg-card)] text-[10px] font-mono tracking-widest uppercase text-[var(--text-secondary)] select-none ${className || ''}`}
      >
        <span>THEME</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-[6px] border border-[var(--border-line)] bg-[var(--bg-card)] px-3 py-2 text-[10px] font-mono tracking-widest uppercase text-[var(--text-primary)] transition-[border-color,background-color] duration-160 ease-out hover:border-[#D4B483]/40 active:scale-[0.98] cursor-pointer select-none ${className || ''}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[#D4B483]" />
          <span>LIGHT MODE</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-[#1F2937]" />
          <span>DARK MODE</span>
        </>
      )}
    </button>
  );
}
