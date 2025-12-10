import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iktupvqdixstntwippyx.supabase.co'
      }
    ]
  },
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH,
  reactStrictMode: true
};

export default nextConfig;
