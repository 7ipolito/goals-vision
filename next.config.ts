import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.futbin.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.futbin.com",
        pathname: "/content/fifa21/img/players/**",
      },
    ],
  },
};

export default nextConfig;
