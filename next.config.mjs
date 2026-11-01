/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['lucide-react', '@phosphor-icons/react'] },
  images: { formats: ['image/webp', 'image/avif'] },
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: process.env.NODE_ENV === 'development' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
      ] },
      { source: '/security/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  async rewrites() {
    // Keep browser API calls same-origin so the Vercel app can reach the live API
    // without requiring the API host to whitelist each frontend deployment URL.
    return [
      // Bare tx-dashboard.nexuspayapp.xyz serves the public dashboard (add the host
      // to this Vercel project). Same path keeps working on the main app domain.
      { source: '/', has: [{ type: 'host', value: 'tx-dashboard.nexuspayapp.xyz' }], destination: '/tx-dashboard' },
      { source: '/', has: [{ type: 'host', value: 'security.nexuspayapp.xyz' }], destination: '/security' },
      { source: '/api/:path*', destination: `${process.env.API_UPSTREAM_ORIGIN || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : 'https://nexuspay-backend-test.vercel.app')}/api/:path*` },
    ];
  },
  async redirects() {
    // BOT Chain is served through the shared multi-chain screens; keep old links working.
    return [
      { source: '/botchain', destination: '/home', permanent: false },
      { source: '/send', destination: '/crypto', permanent: false },
      { source: '/receive/share-qr', destination: '/receive', permanent: false },
      { source: '/receive/amount', destination: '/receive', permanent: false },
    ];
  },
};
export default nextConfig;
