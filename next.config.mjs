import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep build tracing inside this project. Without this explicit root, Next
  // discovers an unrelated parent package-lock.json and scans C:\\Users\\mbonm.
  outputFileTracingRoot: projectRoot,

  // The delivered static site has been fully retired: every public page is a
  // Next.js route owned by this app, so no legacy rewrites are needed. The
  // old fallback (`/:path*` -> `/:path*/index.html`) was removed — dynamic
  // routes were being shadowed by it in production (see earlier fix).
};

export default nextConfig;
