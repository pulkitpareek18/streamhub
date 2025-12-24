'use client';

import { useState, useMemo, useEffect } from 'react';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ChannelSearch } from '@/components/channels/ChannelSearch';
import { Channel } from '@/types/channel';
import { Playlist } from '@/types/playlist';
import { useFavorites } from '@/hooks/useFavorites';
import { usePreferences } from '@/hooks/usePreferences';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useEPG } from '@/hooks/useEPG';
import { Settings, Grid3x3, List, Star, Play, Loader2, ChevronLeft, ChevronRight, Menu, X, Plus, Trash2, Clock } from 'lucide-react';
import { parseM3UFromURL } from '@/lib/parser';
import { formatProgramTime, getProgramProgress } from '@/lib/epgParser';

const DEFAULT_PLAYLIST_URL = process.env.NEXT_PUBLIC_DEFAULT_PLAYLIST_URL || 'https://iptv-org.github.io/iptv/index.m3u';

// Extract language from channel
const extractLanguage = (channel: Channel): string => {
  const name = channel.name.toLowerCase();
  const group = (channel.group || '').toLowerCase();
  if (name.includes('hindi') || group.includes('hindi')) return 'Hindi';
  if (name.includes('tamil') || group.includes('tamil')) return 'Tamil';
  if (name.includes('telugu') || group.includes('telugu')) return 'Telugu';
  if (name.includes('english') || group.includes('english')) return 'English';
  return 'Other';
};

export default function Home() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const { favorites, toggleFavorite} = useFavorites();
  const { preferences, updatePreferences } = usePreferences();
  const { playlists, addPlaylist, removePlaylist, setActivePlaylist, activePlaylistId } = usePlaylists();
  const { epgData, getPrograms, getCurrentProgram } = useEPG(playlist?.epgUrl);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferences.defaultLanguage);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(preferences.viewMode);
  const ITEMS_PER_PAGE = preferences.itemsPerPage;

  // Auto-load default playlist on mount
  useEffect(() => {
    const loadDefaultPlaylist = async () => {
      try {
        const result = await parseM3UFromURL(DEFAULT_PLAYLIST_URL);
        if (result.success && result.playlist) {
          setPlaylist(result.playlist);
        }
      } catch (error) {
        console.error('Failed to load default playlist:', error);
      } finally {
        setIsLoadingPlaylist(false);
      }
    };

    loadDefaultPlaylist();
  }, []);

  // Sync preferences
  useEffect(() => {
    setSelectedLanguage(preferences.defaultLanguage);
    setViewMode(preferences.viewMode);
  }, [preferences]);

  // Get unique categories from playlist
  const categories = useMemo(() => {
    if (!playlist) return [];
    const uniqueCategories = new Set(
      playlist.channels
        .map((ch) => ch.group)
        .filter((group): group is string => !!group)
    );
    return Array.from(uniqueCategories).sort();
  }, [playlist]);

  // Get unique languages from playlist
  const languages = useMemo(() => {
    if (!playlist) return [];
    const uniqueLanguages = new Set(
      playlist.channels.map((ch) => extractLanguage(ch))
    );
    return Array.from(uniqueLanguages).sort();
  }, [playlist]);

  // Filter channels based on search, category, language, and favorites
  const filteredChannels = useMemo(() => {
    if (!playlist) return [];

    let channels = playlist.channels;

    if (showFavoritesOnly) {
      channels = channels.filter((ch) => favorites.includes(ch.id));
    }

    if (selectedCategory) {
      channels = channels.filter((ch) => ch.group === selectedCategory);
    }

    if (selectedLanguage && selectedLanguage !== 'All') {
      channels = channels.filter((ch) => extractLanguage(ch) === selectedLanguage);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      channels = channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query) ||
          ch.group?.toLowerCase().includes(query)
      );
    }

    return channels;
  }, [playlist, searchQuery, selectedCategory, selectedLanguage, showFavoritesOnly, favorites]);

  // Paginate channels - only show ITEMS_PER_PAGE at a time
  const paginatedChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChannels.slice(startIndex, endIndex);
  }, [filteredChannels, currentPage]);

  const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLanguage, showFavoritesOnly]);

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel);
    setShowPlayer(true);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setShowFavoritesOnly(false);
  };

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setSelectedCategory(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {playlist && (
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                  title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
                >
                  {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl">
                S
              </div>
              <h1 className="text-2xl font-bold text-white">StreamHub</h1>
            </div>

            {/* Search */}
            {playlist && (
              <div className="w-96 ml-8">
                <ChannelSearch onSearch={setSearchQuery} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {playlist && (
              <>
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'grid'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'list'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Settings */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {isLoadingPlaylist ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Loading Channels...</h2>
              <p className="text-gray-400">Please wait while we load the IPTV playlist</p>
            </div>
          </div>
        ) : !playlist ? (
          /* Error State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Playlist</h2>
              <p className="text-gray-400 mb-4">Unable to load the default IPTV playlist. Please check your internet connection.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT SIDEBAR - Vertical Categories */}
            {showSidebar && (
              <aside className="w-72 flex-shrink-0 bg-black/40 border-r border-white/5 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Language Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                      <option value="All">All Languages</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Favorites Button */}
                  <button
                    onClick={handleFavoritesToggle}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                      showFavoritesOnly
                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 text-yellow-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-yellow-300' : ''}`} />
                    Favorites
                  </button>

                  {/* All Channels Button */}
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full px-4 py-3 rounded-lg transition-all font-medium text-left ${
                      selectedCategory === null && !showFavoritesOnly
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-indigo-500/50'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                  >
                    All Channels
                  </button>

                  {/* Categories List */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      Categories
                    </h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          title={category}
                          className={`w-full px-4 py-2.5 rounded-lg transition-all font-medium text-left text-sm truncate ${
                            selectedCategory === category && !showFavoritesOnly
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:border-white/10'
                          }`}
                        >
                          <span className="block truncate">{category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* RIGHT MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-y-auto">
              {/* Video Player */}
              {showPlayer && currentChannel && (
                <div className="flex-shrink-0 p-6 pb-0">
                  <div className="relative">
                    {/* Close Player Button */}
                    <button
                      onClick={() => setShowPlayer(false)}
                      className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20 text-white hover:bg-red-500/80 hover:border-red-500 transition-all group"
                      title="Close player"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                      <VideoPlayer
                        streamUrl={currentChannel.url}
                        channelName={currentChannel.name}
                        channelLogo={currentChannel.logo}
                        autoPlay={true}
                      />
                    </div>

                    {/* Now Playing Info */}
                    <div className="mt-4 flex items-start gap-4 pb-4 border-b border-white/10">
                      {currentChannel.logo ? (
                        <img
                          src={currentChannel.logo}
                          alt={currentChannel.name}
                          className="w-16 h-16 rounded-lg object-cover border border-white/10"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/64x64/1f2937/6366f1?text=${currentChannel.name.charAt(0)}`;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                          <span className="text-2xl font-bold text-indigo-400">
                            {currentChannel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {currentChannel.name}
                        </h2>
                        {currentChannel.group && (
                          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm">
                            {currentChannel.group}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleFavorite(currentChannel.id)}
                        className={`p-3 rounded-xl transition-all ${
                          favorites.includes(currentChannel.id)
                            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.includes(currentChannel.id) ? 'fill-yellow-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* EPG Program Guide */}
                    {currentChannel.tvgId && (() => {
                      const { current, upcoming } = getPrograms(currentChannel.tvgId, 3);
                      if (current || upcoming.length > 0) {
                        return (
                          <div className="mt-4 space-y-4">
                            {/* Current Program */}
                            {current && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Now Playing
                                  </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
                                {current.description && (
                                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{current.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                  <span>{formatProgramTime(current.start)} - {formatProgramTime(current.stop)}</span>
                                  {current.category && (
                                    <>
                                      <span>•</span>
                                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                                        {current.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${getProgramProgress(current.start, current.stop)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Upcoming Programs */}
                            {upcoming.length > 0 && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Coming Up
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  {upcoming.map((program, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-16 text-xs text-gray-500 pt-0.5">
                                        {formatProgramTime(program.start)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white text-sm truncate">{program.title}</h4>
                                        {program.description && (
                                          <p className="text-xs text-gray-500 line-clamp-1">{program.description}</p>
                                        )}
                                      </div>
                                      {program.category && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded">
                                          {program.category}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              {/* Channel Grid/List with Pagination */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {showFavoritesOnly
                    ? 'Favorite Channels'
                    : selectedCategory
                    ? selectedCategory
                    : 'All Channels'}
                </h2>
                <p className="text-sm text-gray-400">
                  {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
                </p>
              </div>

              {filteredChannels.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">
                    {showFavoritesOnly
                      ? 'No favorite channels yet'
                      : searchQuery
                      ? 'No channels found'
                      : 'No channels in this category'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {paginatedChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel)}
                      className={`group relative rounded-xl overflow-hidden transition-all ${
                        currentChannel?.id === channel.id
                          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-900'
                          : 'hover:scale-105'
                      }`}
                    >
                      {/* Channel Image/Logo */}
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-600">
                              {channel.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white drop-shadow-lg" />
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {currentChannel?.id === channel.id && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </div>
                        )}

                        {/* Favorite Button */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(channel.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(channel.id);
                            }
                          }}
                          className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all cursor-pointer"
                          aria-label={favorites.includes(channel.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favorites.includes(channel.id)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Channel Info */}
                      <div className="p-3 bg-white/5 border-x border-b border-white/10">
                        <h3 className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                          {channel.name}
                        </h3>
                        {channel.group && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{channel.group}</p>
                        )}
                        {channel.tvgId && (() => {
                          const currentProgram = getCurrentProgram(channel.tvgId);
                          if (currentProgram) {
                            const progress = getProgramProgress(currentProgram.start, currentProgram.stop);
                            return (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-1 text-xs text-indigo-400">
                                  <Clock className="h-3 w-3" />
                                  <span className="truncate">{currentProgram.title}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                  <div
                                    className="bg-indigo-500 h-1 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-2">
                  {paginatedChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel)}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left overflow-hidden ${
                        currentChannel?.id === channel.id
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {currentChannel?.id === channel.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 animate-pulse" />
                      )}

                      <div className="relative flex-shrink-0 z-10">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className={`h-12 w-12 rounded-lg object-cover border transition-all ${
                              currentChannel?.id === channel.id
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
                              currentChannel?.id === channel.id
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400'
                            }`}
                          >
                            {channel.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {currentChannel?.id === channel.id && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 z-10">
                        <h3
                          className={`font-semibold truncate mb-0.5 ${
                            currentChannel?.id === channel.id
                              ? 'text-white'
                              : 'text-gray-200 group-hover:text-white'
                          }`}
                        >
                          {channel.name}
                        </h3>
                        {channel.group && (
                          <p className="text-xs text-gray-500 truncate">{channel.group}</p>
                        )}
                        {channel.tvgId && (() => {
                          const currentProgram = getCurrentProgram(channel.tvgId);
                          if (currentProgram) {
                            const progress = getProgramProgress(currentProgram.start, currentProgram.stop);
                            return (
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-1 text-xs text-indigo-400">
                                  <Clock className="h-3 w-3" />
                                  <span className="truncate">{currentProgram.title}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                  <div
                                    className="bg-indigo-500 h-1 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(channel.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(channel.id);
                          }
                        }}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all z-10 cursor-pointer ${
                          favorites.includes(channel.id)
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'text-gray-600 hover:bg-white/10 hover:text-gray-400'
                        }`}
                        aria-label={favorites.includes(channel.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favorites.includes(channel.id) ? 'fill-yellow-400' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredChannels.length > ITEMS_PER_PAGE && (
                <div className="mt-6 flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredChannels.length)} of {filteredChannels.length} channels
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <div className="flex items-center gap-1 px-3 py-2 text-sm text-white">
                      Page <span className="font-bold text-indigo-400">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
                </div>
            </main>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-all text-white"
                title="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* App Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">App Information</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">App Name</span>
                    <span className="text-white font-medium">StreamHub</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Default Playlist</span>
                    <span className="text-indigo-400 text-sm truncate max-w-xs">{DEFAULT_PLAYLIST_URL}</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Preferences</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Default Language</label>
                    <select
                      value={preferences.defaultLanguage}
                      onChange={(e) => updatePreferences({ defaultLanguage: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="All">All Languages</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-400 text-sm mt-1">Language filter to use when app loads</p>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Default View Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updatePreferences({ viewMode: 'grid' })}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                          preferences.viewMode === 'grid'
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => updatePreferences({ viewMode: 'list' })}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                          preferences.viewMode === 'list'
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        List
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Channel layout preference</p>
                  </div>
                </div>
              </div>

              {/* Playlist Management */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Playlists</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  {/* Add New Playlist */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPlaylistUrl}
                      onChange={(e) => setNewPlaylistUrl(e.target.value)}
                      placeholder="Enter M3U playlist URL..."
                      className="flex-1 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      onClick={async () => {
                        if (!newPlaylistUrl.trim()) return;
                        try {
                          const result = await parseM3UFromURL(newPlaylistUrl);
                          if (result.success && result.playlist) {
                            addPlaylist(result.playlist, newPlaylistUrl);
                            setNewPlaylistUrl('');
                          }
                        } catch (error) {
                          console.error('Failed to load playlist:', error);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {/* Playlist List */}
                  <div className="space-y-2">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          activePlaylistId === pl.id
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{pl.name}</p>
                          <p className="text-gray-400 text-xs truncate">{pl.channelCount} channels</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activePlaylistId !== pl.id && (
                            <button
                              onClick={() => setActivePlaylist(pl.id)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-all"
                            >
                              Load
                            </button>
                          )}
                          <button
                            onClick={() => removePlaylist(pl.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-all"
                            title="Remove playlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Storage</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorite Channels</span>
                    <span className="text-white font-medium">{favorites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Channels</span>
                    <span className="text-white font-medium">{playlist?.channels.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">About</h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    StreamHub is a modern IPTV web player built with Next.js, TypeScript, and Tailwind CSS.
                    It provides a seamless streaming experience with features like favorites, search,
                    category filtering, and language preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-xl px-6 py-4 flex justify-end border-t border-white/10">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
