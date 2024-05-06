// /** @type {import('next').NextConfig} */

// import withPWA from 'next-pwa';

// const nextConfig = {
//   output: "standalone",
//   async redirects() {
//     return [
//       {
//         source: "/",
//         destination: "/onboarding",
//         permanent: false
//       }
//     ];
//   },
//   ...withPWA({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === "development"
//   })
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  }
});

const nextConfig = {};

export default withPWA(nextConfig);