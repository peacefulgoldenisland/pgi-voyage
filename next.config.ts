import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: 'https://admin.peacefulgoldenisland.com/:path*',
        permanent: true,
      },
      {
        source: '/admin',
        destination: 'https://admin.peacefulgoldenisland.com',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
