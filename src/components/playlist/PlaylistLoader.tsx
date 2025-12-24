'use client';

import { useState } from 'react';
import { Link2, Upload, Loader2, AlertCircle } from 'lucide-react';
import { parseM3UFromURL, parseM3UFromFile } from '@/lib/parser';
import { Playlist } from '@/types/playlist';

interface PlaylistLoaderProps {
  onPlaylistLoad: (playlist: Playlist) => void;
}

export function PlaylistLoader({ onPlaylistLoad }: PlaylistLoaderProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMethod, setLoadMethod] = useState<'url' | 'file'>('url');

  const handleUrlLoad = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseM3UFromURL(url);

      if (result.success && result.playlist) {
        onPlaylistLoad(result.playlist);
        setUrl('');
      } else {
        setError(result.error || 'Failed to load playlist');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Playlist load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseM3UFromFile(file);

      if (result.success && result.playlist) {
        onPlaylistLoad(result.playlist);
      } else {
        setError(result.error || 'Failed to load playlist');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('File load error:', err);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4">
          S
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to StreamHub</h2>
        <p className="text-gray-400">Load your IPTV playlist to start watching</p>
      </div>

      {/* Method Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setLoadMethod('url')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            loadMethod === 'url'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
          }`}
        >
          <Link2 className="h-5 w-5" />
          URL
        </button>
        <button
          onClick={() => setLoadMethod('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            loadMethod === 'file'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
          }`}
        >
          <Upload className="h-5 w-5" />
          File
        </button>
      </div>

      {/* URL Input */}
      {loadMethod === 'url' && (
        <div className="space-y-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/playlist.m3u"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <button
            onClick={handleUrlLoad}
            disabled={isLoading || !url.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </span>
            ) : (
              'Load Playlist'
            )}
          </button>
        </div>
      )}

      {/* File Input */}
      {loadMethod === 'file' && (
        <div className="space-y-4">
          <label className="block">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-white/5 transition-all cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-1">
                Click to select M3U/M3U8 file
              </p>
              <p className="text-gray-500 text-sm">
                or drag and drop your playlist file here
              </p>
              <input
                type="file"
                accept=".m3u,.m3u8"
                onChange={handleFileLoad}
                disabled={isLoading}
                className="hidden"
              />
            </div>
          </label>
          {isLoading && (
            <div className="flex items-center justify-center gap-3 text-gray-400 bg-white/5 rounded-xl py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading playlist...</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
