import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@dmcgrid/tokens', '@dmcgrid/db', '@dmcgrid/ui'],
  reactStrictMode: true,
};

export default nextConfig;
