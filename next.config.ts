import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function getS3ConnectSrc(): string[] {
  const rawEndpoint = process.env.S3_ENDPOINT;
  if (!rawEndpoint) {
    return [];
  }

  try {
    return [new URL(rawEndpoint).origin];
  } catch {
    return [];
  }
}

const CONNECT_SRC = [
  "'self'",
  "https:",
  ...getS3ConnectSrc(),
  ...(process.env.NODE_ENV === "development"
    ? ["http://127.0.0.1:9000", "http://localhost:9000"]
    : []),
].join(" ");

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${CONNECT_SRC}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: CONTENT_SECURITY_POLICY,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
