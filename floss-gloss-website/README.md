# Floss & Gloss Dentistry — standalone website

Completely separate from the Local Funnel Radar app: its own `package.json`, no Prisma, no demo pipeline.

## Run locally

```bash
cd floss-gloss-website
npm install
npm run dev
```

Open **http://localhost:3333** (port **3333** so it never collides with the main app on 3000).

## Optional hero video

Create `.env.local`:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://example.com/your-loop.mp4
```

## Deploy

Deploy this folder as its own project on Vercel/Netlify/any static host (`npm run build` → `npm run start` or export if you switch to static).
