import { dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const frontendRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: {
    root: frontendRoot,
  },
  async rewrites() {
    return [
      {
        source: "/index.html",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
