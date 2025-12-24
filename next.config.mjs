/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow build to succeed even with ESLint warnings
    ignoreDuringBuilds: false,
  },
  images: {
    // Allow images from any domain (needed for IPTV channel logos)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable strict mode temporarily to avoid double-mounting issues
  reactStrictMode: true,
};

export default nextConfig;
