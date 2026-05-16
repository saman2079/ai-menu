import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.13", "172.20.10.8", "localhost"],


  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;