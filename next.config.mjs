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
    return [{ source: '/api/:path*', destination: 'https://nexuspay-backend-test.vercel.app/api/:path*' }];
  },
  async redirects() {
    // BOT Chain is served through the shared multi-chain screens; keep old links working.
    return [{ source: '/botchain', destination: '/home', permanent: false }];
  },
};
export default nextConfig;
