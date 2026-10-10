'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const saved = localStorage.getItem('dmcgrid_theme') as 'dark' | 'light' | null;
    const initial = saved || (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dmcgrid_theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'min-h-[44px] min-w-[44px] h-[44px] w-[44px] rounded-[9px] flex items-center justify-center ' +
        'border border-[#2A3441] bg-[#1F2937] text-[#9CA3AF] hover:text-[#D4B483] hover:border-[#D4B483]/50 ' +
        'transition-[transform,border-color,color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer outline-none',
        className
      )}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      )}
    </button>
  );
}
