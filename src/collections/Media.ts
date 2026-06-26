import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', id: 'Media' },
    plural: { en: 'Media', id: 'Media' },
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: { en: 'Image', id: 'Gambar' }, value: 'image' },
        { label: { en: 'Video', id: 'Video' }, value: 'video' },
        { label: { en: 'Embed', id: 'Sematan' }, value: 'embed' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'source',
      type: 'text',
      required: true,
      admin: {
        components: {
          Field: '~/components/admin/MediaSourceField',
        },
        description: 'Paste a URL, upload a file, or use embed code',
      },
    },
    {
      name: 'embedCode',
      type: 'textarea',
      defaultValue: '',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data.type === 'video' || data.type === 'embed',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
