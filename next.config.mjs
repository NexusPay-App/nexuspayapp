/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['lucide-react', '@phosphor-icons/react'] },
  images: { formats: ['image/webp', 'image/avif'] },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }];
  },
  async redirects() {
    // BOT Chain is served through the shared multi-chain screens; keep old links working.
    return [{ source: '/botchain', destination: '/home', permanent: false }];
  },
};
export default nextConfig;
