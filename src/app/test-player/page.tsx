'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Test stream URLs
const TEST_STREAMS = [
  {
    name: 'Big Buck Bunny (HLS)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    logo: 'https://placehold.co/64x64/6366f1/white?text=BBB',
  },
  {
    name: 'Apple Test Stream',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    logo: 'https://placehold.co/64x64/818cf8/white?text=APL',
  },
];

export default function TestPlayerPage() {
  const [currentStream, setCurrentStream] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string>('');
  const [currentLogo, setCurrentLogo] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadStream = (url: string, name: string, logo?: string) => {
    setCurrentStream(url);
    setCurrentChannel(name);
    setCurrentLogo(logo || '');
    setError(null);
  };

  const loadCustomStream = () => {
    if (customUrl) {
      loadStream(customUrl, 'Custom Stream');
    }
  };

  return (
    <div className="min-h-screen bg-background-primary p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HLS Video Player Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Test the HLS video player with sample streams or your own stream URL.
            </p>
          </CardContent>
        </Card>

        {/* Video Player */}
        <VideoPlayer
          streamUrl={currentStream}
          channelName={currentChannel}
          channelLogo={currentLogo}
          autoPlay={true}
          onError={(err) => setError(err)}
        />

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-500">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stream Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Test Streams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {TEST_STREAMS.map((stream, index) => (
                <button
                  key={index}
                  onClick={() => loadStream(stream.url, stream.name, stream.logo)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-accent-primary hover:bg-background-tertiary transition-colors text-left"
                >
                  <img
                    src={stream.logo}
                    alt={stream.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div>
                    <p className="text-gray-100 font-medium">{stream.name}</p>
                    <p className="text-gray-500 text-sm truncate max-w-md">{stream.url}</p>
                  </div>
                  {currentStream === stream.url && (
                    <span className="ml-auto text-accent-primary text-sm font-semibold">
                      Playing
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-2">Custom Stream URL:</p>
              <div className="flex gap-2">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  className="flex-1"
                />
                <Button onClick={loadCustomStream}>Load</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Player Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>HLS.js integration with automatic quality selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Play/pause control with click or button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Volume control with mute toggle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Fullscreen support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Auto-hiding controls (hide after 3 seconds)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Loading and error states with retry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>CORS proxy integration (if configured)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Safari native HLS support fallback</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-400">
            <p>
              <strong className="text-gray-300">Proxy:</strong> If you have configured
              NEXT_PUBLIC_PROXY_URL, all streams will automatically be proxied through your
              Cloudflare Worker.
            </p>
            <p>
              <strong className="text-gray-300">Browser Support:</strong> Works in all modern
              browsers. Safari uses native HLS support.
            </p>
            <p>
              <strong className="text-gray-300">Controls:</strong> Move your mouse over the player
              to show controls. They auto-hide after 3 seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
