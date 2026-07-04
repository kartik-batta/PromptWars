/**
 * Baseline HTTP security headers applied to every route.
 *
 * `next/font/google` downloads fonts at BUILD TIME and serves them from
 * `/_next/static/`, so we do NOT need to allowlist fonts.googleapis.com or
 * fonts.gstatic.com in the CSP. That keeps the policy tighter.
 *
 *   - script-src / style-src: 'self' + 'unsafe-inline' — Next.js emits
 *     inline `<script>` for its runtime and Tailwind emits inline styles.
 *   - img-src includes `data:` for React's dev-only inline images.
 *   - frame-ancestors 'none' + X-Frame-Options: DENY defends against
 *     clickjacking on browsers that support only one of the two.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES.join("; ") },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
