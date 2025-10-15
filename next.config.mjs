/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Increase timeout for long-running API routes (Sora video generation: 2-5 min)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Increase static page generation timeout for long operations
  staticPageGenerationTimeout: 600,
}

export default nextConfig