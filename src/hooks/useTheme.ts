import { useEffect } from 'react';
import type { AppSettings } from '../types';

export function applyTheme(theme: AppSettings['theme']): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function getSystemTheme(): AppSettings['theme'] {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(theme: AppSettings['theme']): void {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}
