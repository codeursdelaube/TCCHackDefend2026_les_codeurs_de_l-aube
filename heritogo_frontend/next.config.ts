import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
 
  images: {
    formats: ['image/avif', 'image/webp'], // images 2x plus légères
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zavdmsyykadplqznsydh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
  },

 
};



export default withNextIntl(nextConfig);

