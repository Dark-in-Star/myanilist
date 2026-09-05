import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images straight from their origin instead of Vercel's optimizer.
    //
    // MyAnimeList's CDN already serves posters and avatars as compressed JPEGs
    // with long-lived caching and permissive CORS, and every asset in `public/`
    // is already WebP — so optimizing buys almost nothing, but bills a
    // transform per width in the generated srcset. With ~100 unique posters on
    // the homepage alone that exhausted the plan's quota, and `/_next/image`
    // began returning 402, which is why some images silently failed to load.
    //
    // `next/image` is still worth keeping for layout stability (`fill`, aspect
    // ratios, lazy loading); only the transform step is dropped.
    unoptimized: true,
    // Unused while `unoptimized` is set, but kept narrow so that re-enabling
    // optimization can't turn the endpoint into an open proxy that anyone can
    // bill transforms against.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myanimelist.cdn-dena.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
