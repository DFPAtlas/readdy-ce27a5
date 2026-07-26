import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  staticPageGenerationTimeout: 120,
  experimental: {
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 16,
  },
};

export default nextConfig;
