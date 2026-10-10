import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@dmcgrid/tokens', '@dmcgrid/db', '@dmcgrid/ui'],
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;
