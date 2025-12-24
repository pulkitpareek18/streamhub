import { useState, useEffect, useCallback } from 'react';
import { Playlist } from '@/types/playlist';

const PLAYLISTS_KEY = 'streamhub-playlists';
const ACTIVE_PLAYLIST_KEY = 'streamhub-active-playlist';

interface StoredPlaylist {
  id: string;
  name: string;
  source: string;
  addedAt: number;
  channelCount: number;
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLAYLISTS_KEY);
      if (stored) {
        setPlaylists(JSON.parse(stored));
      }
      const activeId = localStorage.getItem(ACTIVE_PLAYLIST_KEY);
      if (activeId) {
        setActivePlaylistId(activeId);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  }, []);

  const savePlaylists = useCallback((newPlaylists: StoredPlaylist[]) => {
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
      setPlaylists(newPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }, []);

  const addPlaylist = useCallback(
    (playlist: Playlist, source: string) => {
      const stored: StoredPlaylist = {
        id: Date.now().toString(),
        name: playlist.name || 'Unnamed Playlist',
        source,
        addedAt: Date.now(),
        channelCount: playlist.channels.length,
      };
      const newPlaylists = [...playlists, stored];
      savePlaylists(newPlaylists);
      setActivePlaylistId(stored.id);
      localStorage.setItem(ACTIVE_PLAYLIST_KEY, stored.id);
      return stored.id;
    },
    [playlists, savePlaylists]
  );

  const removePlaylist = useCallback(
    (id: string) => {
      const newPlaylists = playlists.filter((p) => p.id !== id);
      savePlaylists(newPlaylists);
      if (activePlaylistId === id) {
        setActivePlaylistId(null);
        localStorage.removeItem(ACTIVE_PLAYLIST_KEY);
      }
    },
    [playlists, activePlaylistId, savePlaylists]
  );

  const setActivePlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
    localStorage.setItem(ACTIVE_PLAYLIST_KEY, id);
  }, []);

  return {
    playlists,
    activePlaylistId,
    addPlaylist,
    removePlaylist,
    setActivePlaylist,
  };
}
