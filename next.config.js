/** @type {import('next').NextConfig} */
const nextConfig = {
  // Clean config for Next.js 15.x, no experimental.appDir
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig;
