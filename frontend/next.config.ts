import type { NextConfig } from "next";

// The old U-Ledger pages call a FastAPI backend through /api/*. FinLens has its own API routes
// (/api/ask, /api/auth/*, /api/line/webhook), so only forward to a backend when BACKEND_URL is set
// explicitly (local U-Ledger development). On Vercel nothing is forwarded.
const BACKEND_URL = process.env.BACKEND_URL?.trim();

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) return [];
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
    ];
  },
  // Let `next dev` serve its dev assets to a cloudflared tunnel host.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
