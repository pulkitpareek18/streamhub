export interface EPGProgram {
  start: Date;
  stop: Date;
  channel: string; // tvg-id
  title: string;
  description?: string;
  category?: string;
  icon?: string;
  rating?: string;
  episode?: string;
  season?: string;
}

export interface EPGData {
  programs: EPGProgram[];
  lastUpdated: Date;
  sourceUrl?: string;
}

export interface EPGChannelPrograms {
  channelId: string;
  current?: EPGProgram;
  upcoming: EPGProgram[];
}
