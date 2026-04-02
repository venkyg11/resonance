import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  volumeNormalization: boolean;
  crossfadeDuration: number; // 0-10 seconds
  playbackSpeed: number; // 0.5-2
  bassBoost: boolean;
  monoAudio: boolean;
  autoCreateLikedPlaylist: boolean;
  showRecentlyPlayed: boolean;
  defaultStartScreen: 'home' | 'playlist' | 'last-played';
  autoPlayOnLoad: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  volumeNormalization: false,
  crossfadeDuration: 0,
  playbackSpeed: 1,
  bassBoost: false,
  monoAudio: false,
  autoCreateLikedPlaylist: true,
  showRecentlyPlayed: true,
  defaultStartScreen: 'home',
  autoPlayOnLoad: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('music-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  useEffect(() => {
    localStorage.setItem('music-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
