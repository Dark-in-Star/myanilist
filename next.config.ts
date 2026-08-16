import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.nekosapi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.anilist.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
