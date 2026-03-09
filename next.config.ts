import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "belinda.tj",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
