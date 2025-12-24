import { PROXY_URL } from './constants';

/**
 * Wraps a stream URL with the CORS proxy
 *
 * @param url - Original stream URL
 * @param forceProxy - Force proxy even for potentially CORS-friendly URLs
 * @returns Proxied URL
 */
export function proxyUrl(url: string, forceProxy = false): string {
  if (!url) return url;

  // If no proxy URL is configured, return original URL
  if (!PROXY_URL) {
    console.warn('NEXT_PUBLIC_PROXY_URL not configured. Streams may fail due to CORS.');
    return url;
  }

  // If not forcing proxy, check if URL needs proxying
  if (!forceProxy && !needsProxy(url)) {
    return url;
  }

  // Encode the URL and append to proxy
  return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
}

/**
 * Check if URL likely needs proxying
 * Most IPTV streams will need proxying, but some public streams have CORS headers
 *
 * @param url - Stream URL to check
 * @returns true if URL likely needs proxying
 */
export function needsProxy(url: string): boolean {
  if (!url) return false;

  // Generally, all external URLs need proxying unless we know otherwise
  // In the future, we could maintain a whitelist of CORS-friendly domains

  // For now, assume all external URLs need proxying
  return true;
}

/**
 * Check if proxy is configured
 */
export function isProxyConfigured(): boolean {
  return !!PROXY_URL;
}

/**
 * Get the configured proxy URL
 */
export function getProxyUrl(): string {
  return PROXY_URL;
}
