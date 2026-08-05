import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["robogo.qtitpc.dev", "192.168.1.174"],
  compress: true,
  devIndicators: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    webpackBuildWorker: true,
    workerThreads: true,
  },
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
  async redirects() {
    const authAliases = [
      {
        source: "/login",
        destination: "/sign-in",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/sign-up",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/sign-up",
        permanent: false,
      },
    ];

    const logoAliases = [
      "/logo.png",
      "/logo.webp",
      "/logo.svg",
      "/coddy-logo-icon.png",
      "/coddy-logo.svg",
    ].map((source) => ({
      source,
      destination: "/Robogo.svg",
      permanent: true,
    }));

    return [...authAliases, ...logoAliases];
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
