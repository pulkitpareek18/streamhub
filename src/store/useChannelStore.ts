// Placeholder for channel store - will be implemented in Iteration 5
import { create } from 'zustand';
import { Channel, ChannelGroup } from '@/types/channel';

interface ChannelState {
  channels: Channel[];
  groups: ChannelGroup[];
  favorites: string[];
  selectedGroup: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  playlistSource: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedGroup: (group: string | null) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  groups: [],
  favorites: [],
  selectedGroup: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  playlistSource: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));
