import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["duolingo.qtitpc.dev", "192.168.1.174"],
  compress: true,
  devIndicators: false,
  poweredByHeader: false,
  async rewrites() {
    const remoteApiUrl = process.env.REMOTE_API_URL?.trim().replace(/\/$/, "");

    if (!remoteApiUrl) return [];

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${remoteApiUrl}/frontend-api/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|webp|png|jpg|jpeg|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
