'use client';

import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '../ui/Button';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export function VolumeControl({ volume, isMuted, onChange, onMuteToggle }: VolumeControlProps) {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-5 w-5" />;
    } else if (volume < 0.5) {
      return <Volume1 className="h-5 w-5" />;
    } else {
      return <Volume2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      {/* Mute Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMuteToggle}
        className="text-white hover:bg-white/20"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </Button>

      {/* Volume Slider */}
      <div className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all duration-200">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
