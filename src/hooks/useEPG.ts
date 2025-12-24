import { useState, useEffect, useCallback } from 'react';
import { EPGData, EPGProgram } from '@/types/epg';
import { fetchEPG, getChannelPrograms } from '@/lib/epgParser';

export function useEPG(epgUrl?: string) {
  const [epgData, setEpgData] = useState<EPGData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEPG = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchEPG(url);
      if (data) {
        setEpgData(data);
      } else {
        setError('Failed to load EPG data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load EPG');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (epgUrl) {
      loadEPG(epgUrl);
    }
  }, [epgUrl, loadEPG]);

  const getPrograms = useCallback(
    (channelTvgId: string, limit?: number) => {
      return getChannelPrograms(epgData, channelTvgId, limit);
    },
    [epgData]
  );

  const getCurrentProgram = useCallback(
    (channelTvgId: string): EPGProgram | null => {
      const { current } = getChannelPrograms(epgData, channelTvgId, 0);
      return current;
    },
    [epgData]
  );

  return {
    epgData,
    isLoading,
    error,
    getPrograms,
    getCurrentProgram,
    reload: () => epgUrl && loadEPG(epgUrl),
  };
}
