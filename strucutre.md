portfolio/
├── server.ts # Express entry, mounts Payload + EJS
├── payload.config.ts # Payload config (collections, admin, i18n)
├── tsconfig.json
├── .env
├── src/
│ ├── collections/
│ │ ├── Media.ts # photo + video + embed
│ │ ├── Categories.ts
│ │ ├── SiteSettings.ts # singleton global
│ │ └── Users.ts # admin users (Payload built-in, customized)
│ ├── access/
│ │ └── isAdmin.ts
│ └── lib/
│ ├── i18n.ts # public site translations
│ └── getPayloadClient.ts
├── views/ # EJS templates (same as before)
│ ├── layouts/base.ejs
│ ├── partials/
│ └── public/...
├── public/ # static assets
│ ├── css/
│ ├── js/
│ ├── uploads/ # media library (Payload-managed)
│ ├── manifest.json
│ └── sw.js
├── locales/
│ ├── en.json
│ └── id.json
└── data/
└── payload.db # SQLite (gitignored)
