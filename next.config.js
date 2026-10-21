/** @type {import('next').NextConfig} */
const basePath = '/exedy';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  output: 'standalone',
  poweredByHeader: false,
};

module.exports = withPWA(nextConfig);
