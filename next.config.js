/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  generateEtags: false,

  // Ignore ESLint errors during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    domains: ["localhost", "supabase.co"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  // Disable experimental features that are causing issues
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
    scrollRestoration: true,
  },

  // Note: Runtime configuration is now handled per-route with export const runtime = 'nodejs'

  // Redirects
  async redirects() {
    return [
      {
        source: "/test-auth",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/test-equipment",
        destination: "/setup-interview",
        permanent: false,
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
