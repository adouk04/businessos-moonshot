import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase 1 replaces this with a real landing page / auth-aware redirect.
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
