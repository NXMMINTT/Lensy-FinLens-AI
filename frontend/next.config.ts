import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR=.next-build lets a check build run without clobbering a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  // Fund data and PDFs are read from disk at request time (lib/funds.ts, lib/askService.ts), so ship
  // them with the server functions on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./data/verified/**/*", "./data/funds/real/funds.json"],
    "/api/**": ["./docs/pdfs/**/*.pdf"],
  },
  // Let `next dev` serve its dev assets to a cloudflared tunnel host.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
