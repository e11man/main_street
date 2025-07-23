/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure for potential static export if needed by Lovable
  trailingSlash: false,
  
  // Image optimization settings
  images: {
    domains: ['localhost', 'maps.googleapis.com'],
    unoptimized: false,
  },
  
  // Environment variables that should be available to the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  
  // Webpack configuration for both server and client
  webpack: (config, { isServer, dev }) => {
    // Client-side fallbacks for Node.js modules
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

    // Handle CSS imports in JS files
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    return config;
  },

  // Enable SWC for better performance
  experimental: {
    swcTraceProfiling: false,
  },

  // Configure pages directory location
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Output configuration for deployment
  output: 'standalone',
  
  // ESLint configuration
  eslint: {
    dirs: ['pages', 'components', 'lib', 'contexts'],
  },
};

module.exports = nextConfig;