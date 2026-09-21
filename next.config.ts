import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com https://*.stripe.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Allow logo + up to 5 images (3 MB each) via Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      // English public page URLs → existing App Router folders
      { source: "/en/start-now", destination: "/en/start-nu" },
      { source: "/en/thank-you", destination: "/en/bedankt" },
      { source: "/en/terms", destination: "/en/voorwaarden" },
    ];
  },
  async redirects() {
    return [
      // Old section slugs → new nav-aligned names (how-it-works unchanged)
      { source: "/nl/voorbeelden", destination: "/nl/inspiratie", permanent: true },
      { source: "/nl/prijzen", destination: "/nl/oplossingen", permanent: true },
      { source: "/nl/faq", destination: "/nl/gids", permanent: true },
      { source: "/en/examples", destination: "/en/inspiration", permanent: true },
      { source: "/en/pricing", destination: "/en/solutions", permanent: true },
      { source: "/en/faq", destination: "/en/guide", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
