import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Site" },
  access: { read: () => true, update: ({ req }) => !!req.user },
  fields: [
    {
      name: "contactEmail",
      type: "email",
      defaultValue: "dadanromadhan20@gmail.com",
    },
    { name: "instagram", type: "text" },
    { name: "youtube", type: "text" },
    { name: "vimeo", type: "text" },
    { name: "tiktok", type: "text" },
    {
      name: "heroReel",
      type: "upload",
      relationTo: "media",
      admin: { description: "Autoplay muted looping video for homepage hero" },
    },
    { name: "heroTagline", type: "text", localized: true },
    { name: "heroSubtitle", type: "text", localized: true },
    { name: "aboutBio", type: "richText", localized: true },
    { name: "siteTitle", type: "text", localized: true },
  ],
};
