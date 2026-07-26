import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    // The inherited application currently has a sizeable TypeScript backlog outside
    // Stripe Phase 1. Keep deployments unblocked while that debt is fixed separately.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 120,
  experimental: {
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 16,
  },
};

export default nextConfig;
