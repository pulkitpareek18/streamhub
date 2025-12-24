import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const FAVORITES_KEY = 'streamhub-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, []);

  const toggleFavorite = useCallback(
    (channelId: string) => {
      if (favorites.includes(channelId)) {
        // Remove from favorites
        setFavorites(favorites.filter((id) => id !== channelId));
      } else {
        // Add to favorites
        setFavorites([...favorites, channelId]);
      }
    },
    [favorites, setFavorites]
  );

  const isFavorite = useCallback(
    (channelId: string) => {
      return favorites.includes(channelId);
    },
    [favorites]
  );

  const addFavorite = useCallback(
    (channelId: string) => {
      if (!favorites.includes(channelId)) {
        setFavorites([...favorites, channelId]);
      }
    },
    [favorites, setFavorites]
  );

  const removeFavorite = useCallback(
    (channelId: string) => {
      setFavorites(favorites.filter((id) => id !== channelId));
    },
    [favorites, setFavorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  };
}
