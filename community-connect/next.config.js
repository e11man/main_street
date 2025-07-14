/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Completely disable all caching to ensure fresh MongoDB data
  experimental: {
    // Disable static optimization
    staticPageGenerationTimeout: 0,
    // Disable ISR (Incremental Static Regeneration)
    isrMemoryCacheSize: 0,
    // Disable static generation
    workerThreads: false,
    cpus: 1
  },
  // Disable image optimization caching
  images: {
    unoptimized: true,
    // Disable image caching
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Disable static generation caching
  generateEtags: false,
  // Disable compression to avoid caching issues
  compress: false,
  // Disable powered by header
  poweredByHeader: false,
  // Force server-side rendering for all pages
  trailingSlash: false,
  // Disable static exports
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        'child_process': false,
        'fs/promises': false,
        dns: false,
        'timers/promises': false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        path: false,
        url: false,
        querystring: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        constants: false,
        process: false,
      };
    }
    return config;
  },
  // Add other configurations if needed
};

module.exports = nextConfig;
