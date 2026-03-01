# StreamHub

[![CI](https://github.com/pulkitpareek18/streamhub/actions/workflows/ci.yml/badge.svg)](https://github.com/pulkitpareek18/streamhub/actions/workflows/ci.yml)
![Last Commit](https://img.shields.io/github/last-commit/pulkitpareek18/streamhub)
![Stars](https://img.shields.io/github/stars/pulkitpareek18/streamhub)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript-blue)

## Release Snapshot (March 2026)

- Status: Active
- Type: Personal IPTV web player
- Live app: https://streamhub-one.vercel.app
- CI checks: install, lint, type-check, and production build

## Demo Card

[![StreamHub Demo Card](https://opengraph.githubassets.com/1/pulkitpareek18/streamhub)](https://streamhub-one.vercel.app)

StreamHub is a personal IPTV web player built with Next.js and TypeScript, designed for fast playlist loading, clean channel discovery, and HLS playback.

## Features

- M3U playlist parsing from URL
- Channel browsing with search, categories, language filters, and favorites
- Grid/list views with pagination preferences
- HLS playback with player controls
- EPG integration for current program and progress
- Multiple playlist management in local storage
- Optional CORS proxy support for restricted playlist sources
- Utility pages for parser and player testing

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- hls.js
- Lucide React

## Routes

- `/` main player and channel explorer
- `/test-parser` parser debugging page
- `/test-player` player testing page

## Environment Variables

Copy `.env.example` into `.env.local` and set values as needed:

- `NEXT_PUBLIC_PROXY_URL` (optional, recommended for CORS-restricted sources)
- `NEXT_PUBLIC_APP_URL` (app base URL)

Optional:

- `NEXT_PUBLIC_DEFAULT_PLAYLIST_URL` (defaults to IPTV-org playlist when unset)

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run format
```

## Notes

- Use only playlist sources you are authorized to access.
- For heavily restricted streams, deploy and configure the proxy worker referenced by `NEXT_PUBLIC_PROXY_URL`.
