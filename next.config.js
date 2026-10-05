/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // config Next.js lainnya bisa ditambahkan di sini
};

module.exports = withPWA(nextConfig);
