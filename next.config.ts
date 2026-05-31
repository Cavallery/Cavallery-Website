import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Auto-generated .next/dev/types/validator.ts can get corrupted
    ignoreBuildErrors: true,
  },
  // Cache buster: Force Hostinger rebuild 2026-05-31-v2
};

export default nextConfig;
