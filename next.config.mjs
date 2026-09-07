/** @type {import('next').NextConfig} */
const nextConfig = {
  // Migration strategy: the delivered static site lives in /public.
  // Rewrites (which run AFTER filesystem routes) map clean URLs to the
  // static HTML files. As each page is rebuilt as a Next.js route in
  // Phase 2, the app route automatically takes precedence over the
  // rewrite — enabling page-by-page migration with zero downtime.
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/:path*', destination: '/:path*/index.html' },
    ];
  },
};

export default nextConfig;
