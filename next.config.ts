import type { NextConfig } from 'next';

export default {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '55mb',
    },
  },
} as NextConfig;
