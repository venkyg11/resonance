import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'cosmic-dark',
    name: 'Cosmic Dark',
    description: 'Deep space purple vibes',
    emoji: '🌌',
    vars: {
      '--background': '240 20% 4%',
      '--foreground': '0 0% 95%',
      '--card': '240 15% 8%',
      '--card-foreground': '0 0% 95%',
      '--popover': '240 15% 8%',
      '--popover-foreground': '0 0% 95%',
      '--primary': '265 90% 60%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 15% 14%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '240 12% 12%',
      '--muted-foreground': '240 5% 55%',
      '--accent': '230 80% 60%',
      '--accent-foreground': '0 0% 100%',
      '--border': '240 10% 16%',
      '--input': '240 10% 16%',
      '--ring': '265 90% 60%',
      '--glass-bg': '240 15% 10% / 0.6',
      '--glass-border': '240 10% 30% / 0.3',
      '--glow-primary': '265 90% 60%',
      '--glow-accent': '230 80% 60%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(265 90% 60%), hsl(230 80% 60%))',
      '--gradient-primary-hover': 'linear-gradient(135deg, hsl(265 90% 65%), hsl(230 80% 65%))',
    },
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Electric pink & cyan energy',
    emoji: '⚡',
    vars: {
      '--background': '270 20% 3%',
      '--foreground': '0 0% 95%',
      '--card': '270 15% 7%',
      '--card-foreground': '0 0% 95%',
      '--popover': '270 15% 7%',
      '--popover-foreground': '0 0% 95%',
      '--primary': '330 90% 60%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '270 15% 13%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '270 12% 11%',
      '--muted-foreground': '270 5% 55%',
      '--accent': '180 80% 50%',
      '--accent-foreground': '0 0% 100%',
      '--border': '270 10% 15%',
      '--input': '270 10% 15%',
      '--ring': '330 90% 60%',
      '--glass-bg': '270 15% 9% / 0.6',
      '--glass-border': '270 10% 28% / 0.3',
      '--glow-primary': '330 90% 60%',
      '--glow-accent': '180 80% 50%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(330 90% 60%), hsl(180 80% 50%))',
      '--gradient-primary-hover': 'linear-gradient(135deg, hsl(330 90% 65%), hsl(180 80% 55%))',
    },
  },
  {
    id: 'minimal-glass',
    name: 'Minimal Glass',
    description: 'Clean neutral tones',
    emoji: '🪟',
    vars: {
      '--background': '220 15% 5%',
      '--foreground': '0 0% 92%',
      '--card': '220 12% 9%',
      '--card-foreground': '0 0% 92%',
      '--popover': '220 12% 9%',
      '--popover-foreground': '0 0% 92%',
      '--primary': '220 15% 65%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 10% 14%',
      '--secondary-foreground': '0 0% 85%',
      '--muted': '220 8% 12%',
      '--muted-foreground': '220 5% 50%',
      '--accent': '220 20% 55%',
      '--accent-foreground': '0 0% 100%',
      '--border': '220 8% 18%',
      '--input': '220 8% 18%',
      '--ring': '220 15% 65%',
      '--glass-bg': '220 12% 10% / 0.5',
      '--glass-border': '220 8% 28% / 0.3',
      '--glow-primary': '220 15% 65%',
      '--glow-accent': '220 20% 55%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(220 15% 65%), hsl(220 20% 55%))',
      '--gradient-primary-hover': 'linear-gradient(135deg, hsl(220 15% 70%), hsl(220 20% 60%))',
    },
  },
  {
    id: 'aqua-wave',
    name: 'Aqua Wave',
    description: 'Ocean-inspired teals & blues',
    emoji: '🌊',
    vars: {
      '--background': '200 25% 4%',
      '--foreground': '0 0% 95%',
      '--card': '200 20% 8%',
      '--card-foreground': '0 0% 95%',
      '--popover': '200 20% 8%',
      '--popover-foreground': '0 0% 95%',
      '--primary': '175 80% 45%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '200 15% 13%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '200 12% 11%',
      '--muted-foreground': '200 5% 50%',
      '--accent': '210 70% 55%',
      '--accent-foreground': '0 0% 100%',
      '--border': '200 10% 16%',
      '--input': '200 10% 16%',
      '--ring': '175 80% 45%',
      '--glass-bg': '200 15% 9% / 0.6',
      '--glass-border': '200 10% 28% / 0.3',
      '--glow-primary': '175 80% 45%',
      '--glow-accent': '210 70% 55%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(175 80% 45%), hsl(210 70% 55%))',
      '--gradient-primary-hover': 'linear-gradient(135deg, hsl(175 80% 50%), hsl(210 70% 60%))',
    },
  },
  {
    id: 'hacker-matrix',
    name: 'Hacker Matrix',
    description: 'Green terminal aesthetic',
    emoji: '💻',
    vars: {
      '--background': '120 15% 3%',
      '--foreground': '120 60% 75%',
      '--card': '120 12% 6%',
      '--card-foreground': '120 60% 75%',
      '--popover': '120 12% 6%',
      '--popover-foreground': '120 60% 75%',
      '--primary': '120 80% 45%',
      '--primary-foreground': '120 15% 3%',
      '--secondary': '120 10% 10%',
      '--secondary-foreground': '120 40% 65%',
      '--muted': '120 8% 8%',
      '--muted-foreground': '120 15% 40%',
      '--accent': '120 60% 35%',
      '--accent-foreground': '120 80% 80%',
      '--border': '120 10% 14%',
      '--input': '120 10% 14%',
      '--ring': '120 80% 45%',
      '--glass-bg': '120 12% 7% / 0.6',
      '--glass-border': '120 10% 22% / 0.3',
      '--glow-primary': '120 80% 45%',
      '--glow-accent': '120 60% 35%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(120 80% 45%), hsl(120 60% 35%))',
      '--gradient-primary-hover': 'linear-gradient(135deg, hsl(120 80% 50%), hsl(120 60% 40%))',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem('music-theme') || 'cosmic-dark'; }
    catch { return 'cosmic-dark'; }
  });

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    localStorage.setItem('music-theme', themeId);
    const root = document.documentElement;
    Object.entries(currentTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [themeId, currentTheme]);

  const setTheme = (id: string) => setThemeId(id);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
