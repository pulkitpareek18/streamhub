import { useState, useEffect, useCallback } from 'react';

const PREFERENCES_KEY = 'streamhub-preferences';

interface Preferences {
  defaultLanguage: string;
  itemsPerPage: number;
  viewMode: 'grid' | 'list';
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultLanguage: 'All',
  itemsPerPage: 120,
  viewMode: 'grid',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  const updatePreferences = useCallback((updates: Partial<Preferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
      return updated;
    });
  }, []);

  return {
    preferences,
    updatePreferences,
  };
}
