import React, { createContext, useContext, ReactNode } from 'react';

export type Theme = {
  colors: {
    bg: string;
    surface: string;
    text: string;
    subtext: string;
    accent: string;
    accentMuted: string;
    border: string;
    success: string;
    warning: string;
  };
  spacing: (multiplier: number) => number;
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    title: {
      fontSize: number;
      fontWeight: '600' | '700';
    };
    body: {
      fontSize: number;
      fontWeight: '400' | '500';
    };
    caption: {
      fontSize: number;
      fontWeight: '400' | '500';
    };
  };
};

const baseTheme: Theme = {
  colors: {
    bg: '#f7f5f2',
    surface: '#ffffff',
    text: '#1f2d1f',
    subtext: '#4d5b4d',
    accent: '#3c7c5a',
    accentMuted: '#8fb89e',
    border: '#d8e2d8',
    success: '#3c7c5a',
    warning: '#d88c4a',
  },
  spacing: (n: number) => n * 8,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  typography: {
    title: { fontSize: 22, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '500' },
    caption: { fontSize: 14, fontWeight: '400' },
  },
};

const ThemeContext = createContext<Theme>(baseTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={baseTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const theme = baseTheme;
