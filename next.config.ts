import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
    middlewareClientMaxBodySize: '15mb',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/tentang-kami',
        destination: '/#tentang-kami',
        permanent: false,
      },
      {
        source: '/aktivitas',
        destination: '/program',
        permanent: false,
      },
      {
        source: '/kontak',
        destination: '/#kontak',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
