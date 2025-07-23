/**
 * Lovable.dev Configuration File
 * This file contains specific configurations for optimal Lovable deployment
 */

module.exports = {
  // Project metadata
  name: "community-connect",
  version: "1.0.0",
  framework: "nextjs",
  
  // Build configuration
  build: {
    command: "npm run build",
    outputDirectory: ".next",
    installCommand: "npm install",
    devCommand: "npm run dev",
  },
  
  // Environment configuration
  environment: {
    NODE_VERSION: "18.x",
    NPM_VERSION: "8.x",
  },
  
  // Required environment variables for deployment
  requiredEnvVars: [
    "MONGODB_URI",
    "JWT_SECRET",
    "GOOGLE_MAPS_API_KEY"
  ],
  
  // Optional environment variables
  optionalEnvVars: [
    "EMAIL_HOST",
    "EMAIL_PORT", 
    "EMAIL_USER",
    "EMAIL_PASS",
    "NEXT_PUBLIC_APP_URL"
  ],
  
  // File patterns to include in deployment
  include: [
    "pages/**/*",
    "components/**/*", 
    "lib/**/*",
    "contexts/**/*",
    "public/**/*",
    "styles/**/*",
    "scripts/**/*",
    "next.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "package.json",
    "package-lock.json"
  ],
  
  // File patterns to exclude from deployment
  exclude: [
    "node_modules",
    ".git",
    ".env*",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    ".vscode",
    ".idea",
    "community-connect/**/*"
  ],
  
  // Performance optimization settings
  optimization: {
    minifyCSS: true,
    minifyJS: true,
    optimizeImages: true,
    treeshaking: true,
    codesplitting: true
  },
  
  // SEO and meta settings
  meta: {
    title: "Community Connect - Volunteer Platform",
    description: "A comprehensive community platform connecting volunteers with organizations and opportunities",
    keywords: ["community", "volunteers", "organizations", "next.js", "react"],
    author: "Community Connect Team"
  },
  
  // Security settings
  security: {
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  }
};