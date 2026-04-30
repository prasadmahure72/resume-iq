import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling these heavy Node.js-only modules.
  // They must be loaded natively by Node.js at runtime.
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse', 'canvas'],
}

export default nextConfig
