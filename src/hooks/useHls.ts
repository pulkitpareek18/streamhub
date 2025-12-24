import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { proxyUrl } from '@/lib/proxy';

export interface UseHlsOptions {
  autoPlay?: boolean;
  muted?: boolean;
  proxyEnabled?: boolean;
}

export interface QualityLevel {
  index: number;
  height: number;
  width: number;
  bitrate: number;
  name: string;
}

export interface UseHlsReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  currentQuality: number;
  qualityLevels: QualityLevel[];
  loadStream: (url: string) => void;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  setQuality: (levelIndex: number) => void;
  destroy: () => void;
}

export function useHls(options: UseHlsOptions = {}): UseHlsReturn {
  const { autoPlay = false, muted = false, proxyEnabled = true } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 means auto
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial video properties
    video.muted = muted;

    // Clean up on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [muted]);

  // Load stream
  const loadStream = useCallback(
    (url: string) => {
      const video = videoRef.current;
      if (!video) {
        setError('Video element not found');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Apply proxy if enabled
      const streamUrl = proxyEnabled ? proxyUrl(url) : url;

      // Check if HLS is supported
      if (Hls.isSupported()) {
        // Destroy existing instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        // Create new HLS instance
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        // Attach media
        hls.attachMedia(video);

        // Handle media attached
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(streamUrl);
        });

        // Handle manifest parsed
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsLoading(false);

          // Extract quality levels
          const levels: QualityLevel[] = data.levels.map((level, index) => ({
            index,
            height: level.height,
            width: level.width,
            bitrate: level.bitrate,
            name: `${level.height}p`,
          }));

          setQualityLevels(levels);

          // Auto play if enabled
          if (autoPlay) {
            video.play().catch((err) => {
              console.error('Auto-play failed:', err);
              setError('Auto-play blocked by browser');
            });
          }
        });

        // Handle errors
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setIsLoading(false);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error: Failed to load stream');
                // Try to recover
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error: Failed to play stream');
                hls.recoverMediaError();
                break;
              default:
                setError('Fatal error: Cannot play stream');
                hls.destroy();
                break;
            }
          }
        });

        // Handle level switched
        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentQuality(data.level);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl;

        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch((err) => {
              console.error('Auto-play failed:', err);
              setError('Auto-play blocked by browser');
            });
          }
        });

        video.addEventListener('error', () => {
          setIsLoading(false);
          setError('Failed to load stream');
        });
      } else {
        setIsLoading(false);
        setError('HLS is not supported in this browser');
      }
    },
    [autoPlay, proxyEnabled]
  );

  // Play
  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error('Play failed:', err);
      setError('Failed to play video');
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  // Set quality level
  const setQuality = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
  }, []);

  // Destroy
  const destroy = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setQualityLevels([]);
    setCurrentQuality(-1);
  }, []);

  // Track playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return {
    videoRef,
    isLoading,
    isPlaying,
    error,
    currentQuality,
    qualityLevels,
    loadStream,
    play,
    pause,
    togglePlay,
    setQuality,
    destroy,
  };
}
