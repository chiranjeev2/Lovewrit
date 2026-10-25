import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy
// In production: no 'unsafe-eval'
// In development: 'unsafe-eval' is permitted for client dev eval source maps
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com"
  : "'self' 'unsafe-inline' https://checkout.razorpay.com";

const storagePublicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL || "";
let storageOrigin = "";
let storagePattern: { protocol: "https" | "http"; hostname: string } | null = null;
if (storagePublicBaseUrl.trim().length > 0) {
  try {
    const parsed = new URL(storagePublicBaseUrl);
    storageOrigin = parsed.origin;
    storagePattern = {
      protocol: (parsed.protocol.replace(":", "") as "https" | "http") || "https",
      hostname: parsed.hostname,
    };
  } catch {}
}

const cspHeader = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://images.unsplash.com https://*.unsplash.com https://checkout.razorpay.com ${storageOrigin};
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com;
  frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;
  media-src 'self' blob: data: https://cdn.pixabay.com ${storageOrigin};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const remotePatterns: Array<{ protocol: "https" | "http"; hostname: string }> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "**.unsplash.com",
  },
];

if (storagePattern) {
  remotePatterns.push(storagePattern);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
