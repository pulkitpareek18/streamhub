'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Play } from 'lucide-react';
import { useHls } from '@/hooks/useHls';
import { PlayerControls } from './PlayerControls';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  streamUrl?: string | null;
  channelName?: string;
  channelLogo?: string;
  onError?: (error: string) => void;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  streamUrl,
  channelName,
  channelLogo,
  onError,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const {
    videoRef,
    isLoading,
    isPlaying,
    error,
    loadStream,
    togglePlay,
  } = useHls({ autoPlay, muted: false, proxyEnabled: true });

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load stream when URL changes
  useEffect(() => {
    if (streamUrl) {
      loadStream(streamUrl);
    }
  }, [streamUrl, loadStream]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume, videoRef]);

  // Handle mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(true);
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  // Handle mouse move
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  const handleRetry = () => {
    if (streamUrl) {
      loadStream(streamUrl);
    }
  };

  return (
    <div
      className={cn('relative aspect-video w-full rounded-lg overflow-hidden bg-black', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        onClick={togglePlay}
        playsInline
      />

      {/* Channel Info Overlay */}
      {channelName && !isPlaying && !isLoading && !error && (
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          {channelLogo && (
            <img src={channelLogo} alt={channelName} className="h-8 w-8 rounded object-cover" />
          )}
          <span className="text-white font-medium">{channelName}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-accent-primary animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center px-6 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Playback Error</h3>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <Button onClick={handleRetry} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* No Stream Overlay */}
      {!streamUrl && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
          <div className="text-center px-6">
            <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 text-lg font-medium mb-2">No stream selected</h3>
            <p className="text-gray-500 text-sm">
              Select a channel from the sidebar to start watching
            </p>
          </div>
        </div>
      )}

      {/* Player Controls */}
      {streamUrl && !error && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 transition-opacity duration-300',
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <PlayerControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            isFullscreen={isFullscreen}
            isLive={true}
            onPlayPause={togglePlay}
            onVolumeChange={setVolume}
            onMuteToggle={() => setIsMuted(!isMuted)}
            onFullscreenToggle={toggleFullscreen}
          />
        </div>
      )}
    </div>
  );
}
