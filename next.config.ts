import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Lets next/image optimize photos uploaded through the Sanity Studio
    // (they're served from Sanity's CDN, not from this site's own domain).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
