/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['lucide-react', '@phosphor-icons/react'] },
  images: { formats: ['image/webp', 'image/avif'] },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }];
  },
  async rewrites() {
    // Keep browser API calls same-origin so the Vercel app can reach the live API
    // without requiring the API host to whitelist each frontend deployment URL.
    return [
      // Bare tx-dashboard.nexuspayapp.xyz serves the public dashboard (add the host
      // to this Vercel project). Same path keeps working on the main app domain.
      { source: '/', has: [{ type: 'host', value: 'tx-dashboard.nexuspayapp.xyz' }], destination: '/tx-dashboard' },
      { source: '/api/:path*', destination: 'https://nexuspay-backend-test.vercel.app/api/:path*' },
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
