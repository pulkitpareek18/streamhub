'use client';

import { useEffect, useRef, useState } from 'react';
import { Channel } from '@/types/channel';
import { ChannelCard } from './ChannelCard';
import { Loader2 } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  activeChannelId?: string | null;
  favorites: string[];
  onChannelSelect: (channel: Channel) => void;
  onFavoriteToggle: (channelId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const ITEM_HEIGHT = 76; // Height of each channel card
const OVERSCAN = 3; // Number of items to render outside viewport

export function ChannelList({
  channels,
  activeChannelId,
  favorites,
  onChannelSelect,
  onFavoriteToggle,
  isLoading = false,
  emptyMessage = 'No channels found',
}: ChannelListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate visible range
  const totalHeight = channels.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    channels.length - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleChannels = channels.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * ITEM_HEIGHT;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-accent-primary animate-spin mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleChannels.map((channel) => (
            <div
              key={channel.id}
              style={{ height: ITEM_HEIGHT }}
              className="px-3 py-2"
            >
              <ChannelCard
                channel={channel}
                isActive={channel.id === activeChannelId}
                isFavorite={favorites.includes(channel.id)}
                onClick={() => onChannelSelect(channel)}
                onFavoriteToggle={() => onFavoriteToggle(channel.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
