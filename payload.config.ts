import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import {
  lexicalEditor,
  BlocksFeature,
  CodeBlock,
} from "@payloadcms/richtext-lexical";

import { Media } from "./src/collections/Media";
import { Categories } from "./src/collections/Categories";
import { SiteSettings } from "./src/collections/SiteSettings";
import { Users } from "./src/collections/Users";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " — Dadan R. Admin" },
  },
  collections: [Media, Categories, Users],
  globals: [SiteSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [
          CodeBlock({
            languages: {
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              html: 'HTML',
              css: 'CSS',
              python: 'Python',
              bash: 'Bash',
              json: 'JSON',
              xml: 'XML',
            },
          }),
        ],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: { outputFile: path.resolve(__dirname, "src/payload-types.ts") },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./data/payload.db",
    },
  }),
  localization: {
    locales: ["en", "id"],
    defaultLocale: "en",
    fallback: true,
  },
});
