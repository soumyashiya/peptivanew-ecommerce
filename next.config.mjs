/** @type {import('next').NextConfig} */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// app/api/send-order-confirmation/route.js imports the VPS-only shared-email
// module from outside the repo. Where that module is absent (Vercel, fresh
// clones) swap the import for a local no-op so the build still succeeds.
// On the VPS the real module exists and is used unchanged.
const ROOT = dirname(fileURLToPath(import.meta.url));
const SHARED_EMAIL = resolve(ROOT, "app/api/send-order-confirmation", "../../../../../shared-email/order-email.js");
const EMAIL_FALLBACK = resolve(ROOT, "lib/order-email-fallback.js");

// Upstream User Order service — proxied through Next so browser requests stay
// same-origin (the service does not send CORS headers for localhost).
const API_UPSTREAM =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://www.microservices.tech";

// Security headers applied to every route. HSTS is intentionally scoped to
// the deployed origin (browsers ignore it on http/localhost).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Tuned to the layout's real breakpoints (see tailwind.config screens).
    deviceSizes: [360, 430, 640, 750, 828, 1080, 1200, 1320, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Short optimizer cache so swapped images (same filename, new content) don't
    // linger for a year. Static assets with hashed URLs still get long cache
    // via the /_next/static header rule below.
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack(config, { webpack }) {
    if (!existsSync(SHARED_EMAIL)) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/shared-email[\\/]order-email\.js$/, (r) => {
          r.request = EMAIL_FALLBACK;
        })
      );
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
  async rewrites() {
    // Proxy every backend path to the User Order service so the browser only
    // ever sees same-origin `/api/*` calls (no CORS). This must run as a
    // `fallback` rewrite (checked only after filesystem routes, including our
    // own app/api/* route handlers) — an ordinary rewrite is matched before
    // API routes and would swallow local routes like
    // /api/send-order-confirmation, proxying them upstream where they 502.
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/api/:path*", destination: `${API_UPSTREAM}/api/:path*` },
        { source: "/health", destination: `${API_UPSTREAM}/health` },
        { source: "/uploads/:path*", destination: `${API_UPSTREAM}/uploads/:path*` },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // In production, static chunks have content-hashed filenames so
        // `immutable` is safe. In dev, HMR chunks reuse the same URL after a
        // file change — an immutable cache would freeze the stale version.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProd
              ? "public, max-age=31536000, immutable"
              : "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProd
              ? "public, max-age=31536000, immutable"
              : "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Raw /public/images/* served directly (not via Next Image optimizer).
        // Force browsers to revalidate so replaced files show up immediately
        // instead of serving a stale copy from cache.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
