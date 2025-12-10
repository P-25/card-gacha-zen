import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  images: {
    // If we are in 'development', turn off optimization.
    // If in 'production', keep it on for speed.
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
