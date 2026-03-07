import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/canary-blog",
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
