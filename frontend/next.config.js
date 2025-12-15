/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  allowedDevOrigins: [
    'https://72da44c2-f982-42f7-9c8f-bd938468a646-00-1cbywz16da6yx.sisko.replit.dev',
    'http://72da44c2-f982-42f7-9c8f-bd938468a646-00-1cbywz16da6yx.sisko.replit.dev',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://0.0.0.0:5000',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
