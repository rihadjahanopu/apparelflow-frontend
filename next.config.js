/** @type {import('next').NextConfig} */
const rawBackend = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const backendTarget = rawBackend.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api';

const nextConfig = {
  reactStrictMode: true,
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
