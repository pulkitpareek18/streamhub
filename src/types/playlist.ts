import { Channel, ChannelGroup } from './channel';

export interface Playlist {
  name?: string;
  channels: Channel[];
  groups: ChannelGroup[];
  totalCount: number;
  loadedAt: Date;
  source: 'url' | 'file';
  sourceUrl?: string;
  epgUrl?: string;
}

export interface PlaylistParseResult {
  success: boolean;
  playlist?: Playlist;
  error?: string;
}
