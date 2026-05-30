import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server build (.next/standalone) so the frontend
  // can run in a minimal Docker image. No effect on the Vercel deployment.
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
