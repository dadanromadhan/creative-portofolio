import { getPayload, type Payload } from "payload";
import config from "../../payload.config.ts";

let payloadInstance: Payload | null = null;

export async function getPublicData(lang: "en" | "id") {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  const payload = payloadInstance;

  const [settings, media, categories] = await Promise.all([
    payload.findGlobal({
      slug: "site-settings",
      locale: lang,
      fallbackLocale: "en",
    }),
    payload.find({
      collection: "media",
      locale: lang,
      fallbackLocale: "en",
      sort: "-featured,sortOrder",
      limit: 100,
    }),
    payload.find({
      collection: "categories",
      locale: lang,
      fallbackLocale: "en",
      sort: "order",
    }),
  ]);

  return {
    settings,
    media: media.docs,
    categories: categories.docs,
  };
}
