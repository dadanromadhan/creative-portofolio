import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  serverExternalPackages: ['ejs', 'express-ejs-layouts', 'helmet'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default withPayload(nextConfig)
