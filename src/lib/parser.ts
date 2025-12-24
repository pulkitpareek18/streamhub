import { PlaylistParseResult, Playlist } from '@/types/playlist';
import { Channel, ChannelGroup } from '@/types/channel';

/**
 * Parse M3U/M3U8 playlist content
 *
 * Expected format:
 * #EXTM3U
 * #EXTINF:-1 tvg-id="channel1" tvg-name="Channel One" tvg-logo="http://logo.png" group-title="News",Channel One HD
 * http://stream.url/channel1.m3u8
 */
export function parseM3U(content: string): PlaylistParseResult {
  try {
    if (!content || !content.trim()) {
      return {
        success: false,
        error: 'Empty playlist content',
      };
    }

    // Normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n');

    // Check for #EXTM3U header
    if (!lines[0]?.trim().startsWith('#EXTM3U')) {
      return {
        success: false,
        error: 'Invalid M3U format: missing #EXTM3U header',
      };
    }

    // Extract EPG URL from header if present
    let epgUrl: string | undefined;
    const epgUrlMatch = lines[0].match(/(?:x-tvg-url|url-tvg)="([^"]+)"/i);
    if (epgUrlMatch) {
      epgUrl = epgUrlMatch[1];
    }

    const channels: Channel[] = [];
    let currentExtinf: string | null = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments that are not #EXTINF
      if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
        continue;
      }

      if (line.startsWith('#EXTINF')) {
        currentExtinf = line;
      } else if (currentExtinf && isValidUrl(line)) {
        // This line is the stream URL
        const channel = parseChannel(currentExtinf, line);
        if (channel) {
          channels.push(channel);
        }
        currentExtinf = null;
      }
    }

    if (channels.length === 0) {
      return {
        success: false,
        error: 'No valid channels found in playlist',
      };
    }

    const groups = extractGroups(channels);

    const playlist: Playlist = {
      channels,
      groups,
      totalCount: channels.length,
      loadedAt: new Date(),
      source: 'file',
      epgUrl,
    };

    return {
      success: true,
      playlist,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse M3U playlist',
    };
  }
}

/**
 * Parse a single channel from EXTINF line and URL
 */
function parseChannel(extinfLine: string, url: string): Channel | null {
  try {
    // Extract the channel name (after the last comma)
    const lastCommaIndex = extinfLine.lastIndexOf(',');
    if (lastCommaIndex === -1) {
      return null;
    }

    const name = extinfLine.substring(lastCommaIndex + 1).trim();
    if (!name) {
      return null;
    }

    // Extract attributes from the EXTINF line
    const attributes = parseExtinfAttributes(extinfLine);

    const channel: Channel = {
      id: generateChannelId(name, url),
      name,
      url,
      ...attributes,
    };

    return channel;
  } catch {
    return null;
  }
}

/**
 * Parse attributes from EXTINF line
 * Format: #EXTINF:-1 tvg-id="id" tvg-name="name" tvg-logo="logo" group-title="group",Name
 */
function parseExtinfAttributes(extinfLine: string): Partial<Channel> {
  const attributes: Partial<Channel> = {};

  // Regular expressions for different attribute formats
  const patterns = {
    tvgId: /tvg-id="([^"]*)"/i,
    tvgName: /tvg-name="([^"]*)"/i,
    tvgLogo: /tvg-logo="([^"]*)"/i,
    group: /group-title="([^"]*)"/i,
    language: /language="([^"]*)"/i,
    country: /country="([^"]*)"/i,
  };

  const tvgIdMatch = extinfLine.match(patterns.tvgId);
  if (tvgIdMatch) attributes.tvgId = tvgIdMatch[1];

  const tvgNameMatch = extinfLine.match(patterns.tvgName);
  if (tvgNameMatch) attributes.tvgName = tvgNameMatch[1];

  const tvgLogoMatch = extinfLine.match(patterns.tvgLogo);
  if (tvgLogoMatch) {
    attributes.tvgLogo = tvgLogoMatch[1];
    attributes.logo = tvgLogoMatch[1]; // Use tvg-logo as the main logo
  }

  const groupMatch = extinfLine.match(patterns.group);
  if (groupMatch) attributes.group = groupMatch[1];

  const languageMatch = extinfLine.match(patterns.language);
  if (languageMatch) attributes.language = languageMatch[1];

  const countryMatch = extinfLine.match(patterns.country);
  if (countryMatch) attributes.country = countryMatch[1];

  return attributes;
}

/**
 * Generate a unique channel ID from name and URL
 */
export function generateChannelId(name: string, url: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const urlHash = simpleHash(url);
  return `${cleanName}-${urlHash}`;
}

/**
 * Simple hash function for generating IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract and organize channels into groups
 */
export function extractGroups(channels: Channel[]): ChannelGroup[] {
  const groupMap = new Map<string, Channel[]>();

  channels.forEach((channel) => {
    const groupName = channel.group || 'Uncategorized';
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName)!.push(channel);
  });

  const groups: ChannelGroup[] = [];
  groupMap.forEach((channels, name) => {
    groups.push({
      name,
      channels,
      count: channels.length,
    });
  });

  // Sort groups by name
  groups.sort((a, b) => a.name.localeCompare(b.name));

  return groups;
}

/**
 * Validate if a string is a valid URL
 */
function isValidUrl(str: string): boolean {
  if (!str || str.startsWith('#')) {
    return false;
  }

  // Check for common protocols
  const protocols = ['http://', 'https://', 'rtmp://', 'rtsp://', 'mms://'];
  return protocols.some((protocol) => str.toLowerCase().startsWith(protocol));
}

/**
 * Load and parse M3U playlist from URL
 */
export async function parseM3UFromURL(url: string): Promise<PlaylistParseResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch playlist: ${response.status} ${response.statusText}`,
      };
    }

    const content = await response.text();
    const result = parseM3U(content);

    if (result.success && result.playlist) {
      result.playlist.source = 'url';
      result.playlist.sourceUrl = url;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load playlist from URL',
    };
  }
}

/**
 * Load and parse M3U playlist from File object
 */
export async function parseM3UFromFile(file: File): Promise<PlaylistParseResult> {
  try {
    const content = await file.text();
    const result = parseM3U(content);

    if (result.success && result.playlist) {
      result.playlist.source = 'file';
      result.playlist.name = file.name;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read playlist file',
    };
  }
}
