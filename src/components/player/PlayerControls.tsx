'use client';

import { Play, Pause, Maximize, Minimize, Radio } from 'lucide-react';
import { Button } from '../ui/Button';
import { VolumeControl } from './VolumeControl';

interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isLive?: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
}

export function PlayerControls({
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  isLive = false,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
}: PlayerControlsProps) {
  return (
    <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="text-white hover:bg-white/20"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        {/* Volume Control */}
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
        />

        {/* Live Indicator */}
        {isLive && (
          <div className="flex items-center gap-2 ml-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold">
              <Radio className="h-3 w-3 animate-pulse" />
              LIVE
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fullscreen */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreenToggle}
          className="text-white hover:bg-white/20"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
