// Placeholder for player store - will be implemented in Iteration 4
import { create } from 'zustand';
import { Channel } from '@/types/channel';

interface PlayerState {
  currentChannel: Channel | null;
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  volume: number;
  error: string | null;

  setChannel: (channel: Channel) => void;
  setPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setError: (error: string | null) => void;
  clearChannel: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentChannel: null,
  isPlaying: false,
  isLoading: false,
  isMuted: false,
  volume: 0.8,
  error: null,

  setChannel: (channel) => set({ currentChannel: channel }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setLoading: (loading) => set({ isLoading: loading }),
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume }),
  setError: (error) => set({ error }),
  clearChannel: () => set({ currentChannel: null }),
}));
