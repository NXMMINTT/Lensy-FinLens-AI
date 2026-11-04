import type { NextConfig } from "next";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").trim();

const nextConfig: NextConfig = {
  // One public origin for everything (LIFF, tunnel, phone): the browser calls /api/* on this
  // origin and Next forwards to FastAPI — so the LINE webhook can use this URL too.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
    ];
  },
  // Let `next dev` serve its dev assets to the cloudflared tunnel host.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
