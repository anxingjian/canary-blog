import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/canary-blog",
  trailingSlash: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
