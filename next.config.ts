/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignoruje ESLint chyby při nahrávání na Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignoruje TypeScript chyby při nahrávání na Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;