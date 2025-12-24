// Placeholder for settings store - will be implemented in Iteration 6
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  proxyUrl: string;
  autoPlay: boolean;
  defaultVolume: number;
  showFavoritesFirst: boolean;
  theme: 'dark' | 'light' | 'system';
  rememberLastChannel: boolean;
  compactView: boolean;
  lastChannelId: string | null;
  lastPlaylistUrl: string | null;

  updateSettings: (partial: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const defaultSettings: Omit<SettingsState, 'updateSettings' | 'resetSettings'> = {
  proxyUrl: process.env.NEXT_PUBLIC_PROXY_URL || '',
  autoPlay: true,
  defaultVolume: 0.8,
  showFavoritesFirst: false,
  theme: 'dark',
  rememberLastChannel: false,
  compactView: false,
  lastChannelId: null,
  lastPlaylistUrl: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (partial) => set(partial),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'streamhub-settings',
    }
  )
);
