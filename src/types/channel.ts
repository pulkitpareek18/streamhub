export interface Channel {
  id: string;
  name: string;
  logo?: string;
  url: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  language?: string;
  country?: string;
  isNSFW?: boolean;
}

export interface ChannelGroup {
  name: string;
  channels: Channel[];
  count: number;
}
