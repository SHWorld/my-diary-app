import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_DOMAIN!, // ← あなたのSupabase画像URLのドメイン
    ],
  },
};

export default nextConfig;
