/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow external image URLs used in profile/cover pics
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Hide the Next.js dev tools indicator badge
  devIndicators: false,
};

export default nextConfig;
