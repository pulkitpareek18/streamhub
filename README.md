# StreamHub - Personal IPTV Web Player

A modern, web-based IPTV player built with Next.js 14, TypeScript, and Tailwind CSS.

## Project Status

**Current Iteration: 3 (Complete)** ✅

### Completed Features

#### Iteration 1: Foundation
- ✅ Next.js 14 with App Router and TypeScript
- ✅ Tailwind CSS with dark mode theme
- ✅ Project structure with organized components
- ✅ Base layout (Header, Sidebar, Main)
- ✅ UI components (Button, Input, Card, Skeleton)
- ✅ TypeScript type definitions
- ✅ Zustand state management setup
- ✅ ESLint and Prettier configuration

#### Iteration 2: M3U Parser
- ✅ M3U/M3U8 playlist parser implementation
- ✅ Extract channel metadata (tvg-id, tvg-name, tvg-logo, group-title)
- ✅ Handle various playlist formats and edge cases
- ✅ Load playlists from URL or File object
- ✅ Generate unique channel IDs
- ✅ Organize channels into groups
- ✅ Comprehensive error handling
- ✅ Test page at `/test-parser`

#### Iteration 3: CORS Proxy
- ✅ Cloudflare Worker implementation
- ✅ CORS header handling
- ✅ M3U8 URL rewriting for HLS streams
- ✅ Support for video segments (.ts, .mp4)
- ✅ Streaming response (no buffering)
- ✅ Range request support
- ✅ Proxy utility functions for Next.js
- ✅ Deployment configuration and documentation

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
npm run type-check
```

### Format Code

```bash
npm run format
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Video Player:** hls.js (Iteration 4)
- **Icons:** Lucide React

## Project Structure

```
streamhub/
├── src/
│   ├── app/
│   │   ├── api/proxy/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── player/
│   │   └── channels/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── hooks/
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Testing

### Parser Tests
Visit [http://localhost:3000/test-parser](http://localhost:3000/test-parser) to test the M3U parser:
- Basic M3U parsing
- Edge cases (missing attributes, malformed entries, special characters)
- URL loading (try: https://iptv-org.github.io/iptv/countries/us.m3u)

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete deployment instructions.

### Quick Start - Cloudflare Worker

```bash
cd ../cloudflare-worker
npm install
npx wrangler login
npm run deploy:prod
```

Copy the worker URL and add to `streamhub/.env.local`:
```env
NEXT_PUBLIC_PROXY_URL=https://your-worker.workers.dev
```

## Upcoming Iterations

- **Iteration 4:** Video Player Component (HLS.js)
- **Iteration 5:** Channel List & Search UI
- **Iteration 6:** Polish, Settings & PWA

## Development Methodology

This project follows an Agile development approach with 6 planned iterations. Each iteration builds upon the previous one, adding functionality incrementally.

## License

Personal project - All rights reserved
