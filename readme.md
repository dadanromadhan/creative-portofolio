# Dadan R. — Portfolio

Lightweight bilingual (EN + ID) portfolio for videographer / photographer / editor.

## Stack

- Node.js + Express (EJS SSR)
- SQLite (better-sqlite3)
- TailwindCSS (CDN)
- PWA-ready

## Quick start

```bash
npm install
cp .env.example .env   # then edit .env
npm run init-db        # creates SQLite + seeds default content & admin
npm run dev            # http://localhost:3000
```

## Admin

- URL: `/admin/login`
- Default creds from `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
- ⚠️ Change password after first login

## Project layout

```
server.js              # Express entry
config/                # DB + init
middleware/            # i18n, auth
routes/                # public + admin
views/                 # EJS templates (layouts, public, admin)
public/                # static (css, js, uploads, manifest, sw)
locales/               # en.json, id.json
data/                  # SQLite + sessions (gitignored)
```

## Adding media

(Wired up in Phase 3) — admin panel → Media → upload or paste embed URL.

## Deployment

Works on any Node host: Render, Railway, Fly.io, VPS, etc.
Set `NODE_ENV=production` and a strong `SESSION_SECRET`.

## Browser support

Modern browsers (Chrome/Edge/Safari/Firefox, iOS 14+, Android 9+).
