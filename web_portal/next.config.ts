import type { NextConfig } from "next";
import path from "path";

const rootPath = path.resolve(__dirname);

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  outputFileTracingRoot: rootPath,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  turbopack: {
    root: rootPath,
  },
};

export default nextConfig;
