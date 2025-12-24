'use client';

import { Star } from 'lucide-react';
import { Channel } from '@/types/channel';

interface ChannelCardProps {
  channel: Channel;
  isActive?: boolean;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
}

export function ChannelCard({
  channel,
  isActive = false,
  isFavorite = false,
  onClick,
  onFavoriteToggle,
}: ChannelCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
          : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 animate-pulse" />
      )}

      {/* Channel Logo */}
      <div className="relative flex-shrink-0 z-10">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className={`h-12 w-12 rounded-lg object-cover border transition-all ${
              isActive
                ? 'border-indigo-400/50 shadow-lg shadow-indigo-500/30'
                : 'border-white/10'
            }`}
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/48x48/1f2937/6366f1?text=${channel.name.charAt(0)}`;
            }}
          />
        ) : (
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold text-lg ${
              isActive
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400'
            }`}
          >
            {channel.name.charAt(0).toUpperCase()}
          </div>
        )}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0 z-10">
        <h3
          className={`font-semibold truncate mb-0.5 ${
            isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
          }`}
        >
          {channel.name}
        </h3>
        {channel.group && (
          <p className="text-xs text-gray-500 truncate">{channel.group}</p>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`flex-shrink-0 p-2 rounded-lg transition-all z-10 ${
          isFavorite
            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            : 'text-gray-600 hover:bg-white/10 hover:text-gray-400'
        }`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
      </button>
    </button>
  );
}
