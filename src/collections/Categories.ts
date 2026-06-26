import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "label", group: "Content" },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: "label", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "icon",
      type: "text",
      admin: { description: "Emoji or short text (e.g. 💍)" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
