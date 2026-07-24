import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside a worktree under a larger workspace that has its own
  // lockfiles. Without pinning the root, Turbopack walks up and infers one of
  // those instead of this directory.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
