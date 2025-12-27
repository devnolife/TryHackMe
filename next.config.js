/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enable standalone output for Docker
  output: 'standalone',

  // Experimental features
  experimental: {
    // Instrument for better error traces
    instrumentationHook: true,
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
}

module.exports = nextConfig
