import { EPGProgram, EPGData } from '@/types/epg';

/**
 * Parse XMLTV format EPG data
 */
export function parseXMLTV(xmlContent: string): EPGData | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return null;
    }

    const programs: EPGProgram[] = [];
    const programElements = xmlDoc.querySelectorAll('programme');

    programElements.forEach((programEl) => {
      try {
        const start = parseXMLTVDate(programEl.getAttribute('start'));
        const stop = parseXMLTVDate(programEl.getAttribute('stop'));
        const channel = programEl.getAttribute('channel');

        if (!start || !stop || !channel) {
          return; // Skip invalid program
        }

        const titleEl = programEl.querySelector('title');
        const title = titleEl?.textContent?.trim();

        if (!title) {
          return; // Skip programs without title
        }

        const descEl = programEl.querySelector('desc');
        const description = descEl?.textContent?.trim();

        const categoryEl = programEl.querySelector('category');
        const category = categoryEl?.textContent?.trim();

        const iconEl = programEl.querySelector('icon');
        const icon = iconEl?.getAttribute('src') || undefined;

        const ratingEl = programEl.querySelector('rating value');
        const rating = ratingEl?.textContent?.trim();

        const episodeEl = programEl.querySelector('episode-num[system="onscreen"]');
        const episode = episodeEl?.textContent?.trim();

        const program: EPGProgram = {
          start,
          stop,
          channel,
          title,
          description,
          category,
          icon,
          rating,
          episode,
        };

        programs.push(program);
      } catch (error) {
        console.warn('Error parsing program element:', error);
      }
    });

    return {
      programs,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error parsing XMLTV:', error);
    return null;
  }
}

/**
 * Parse XMLTV date format (YYYYMMDDHHmmss +ZZZZ)
 */
function parseXMLTVDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  try {
    // Format: 20231225120000 +0000
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/);

    if (!match) return null;

    const [, year, month, day, hour, minute, second, timezone] = match;

    // Create date in UTC
    const date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));

    // Apply timezone offset if present
    if (timezone) {
      const sign = timezone[0] === '+' ? 1 : -1;
      const tzHours = parseInt(timezone.slice(1, 3));
      const tzMinutes = parseInt(timezone.slice(3, 5));
      const offsetMs = sign * (tzHours * 60 + tzMinutes) * 60 * 1000;
      date.setTime(date.getTime() - offsetMs);
    }

    return date;
  } catch (error) {
    console.warn('Error parsing XMLTV date:', dateStr, error);
    return null;
  }
}

/**
 * Fetch and parse EPG data from URL
 */
export async function fetchEPG(url: string): Promise<EPGData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch EPG:', response.status, response.statusText);
      return null;
    }

    const content = await response.text();
    const epgData = parseXMLTV(content);

    if (epgData) {
      epgData.sourceUrl = url;
    }

    return epgData;
  } catch (error) {
    console.error('Error fetching EPG:', error);
    return null;
  }
}

/**
 * Get current and upcoming programs for a channel
 */
export function getChannelPrograms(
  epgData: EPGData | null,
  channelTvgId: string,
  limit: number = 5
): { current: EPGProgram | null; upcoming: EPGProgram[] } {
  if (!epgData || !channelTvgId) {
    return { current: null, upcoming: [] };
  }

  const now = new Date();
  const channelPrograms = epgData.programs
    .filter((p) => p.channel === channelTvgId)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Find current program
  const current = channelPrograms.find(
    (p) => p.start <= now && p.stop > now
  ) || null;

  // Find upcoming programs
  const upcoming = channelPrograms
    .filter((p) => p.start > now)
    .slice(0, limit);

  return { current, upcoming };
}

/**
 * Format program time for display
 */
export function formatProgramTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format program duration
 */
export function formatProgramDuration(start: Date, stop: Date): string {
  const durationMs = stop.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 60000);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Calculate program progress (0-100)
 */
export function getProgramProgress(start: Date, stop: Date): number {
  const now = new Date();
  const total = stop.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  if (elapsed < 0) return 0;
  if (elapsed > total) return 100;

  return Math.round((elapsed / total) * 100);
}
