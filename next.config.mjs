import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep build tracing inside this project. Without this explicit root, Next
  // discovers an unrelated parent package-lock.json and scans C:\\Users\\mbonm.
  outputFileTracingRoot: projectRoot,

  // Migration strategy: the delivered static site lives in /public.
  // The legacy URLs map clean URLs to the static HTML files via a FALLBACK
  // rewrite — fallback rewrites run only after ALL app routes (including
  // dynamic [slug]/[id] routes and API handlers) fail to match. A plain
  // array here would be an "afterFiles" rewrite, which shadows every
  // dynamic route (they are resolved after afterFiles) and 404s them in
  // production — that bug shipped earlier and broke /admin/site/business/[slug],
  // /news/[slug], etc. As pages are rebuilt as Next.js routes, the app route
  // wins and the fallback never fires.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: '/', destination: '/index.html' },
        { source: '/:path*', destination: '/:path*/index.html' },
      ],
    };
  },
};

export default nextConfig;
