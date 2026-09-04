/** @type {import('next').NextConfig} */
const nextConfig = {
  // Accept both /admin and /admin/ without Next.js issuing a canonical
  // trailing-slash redirect. This avoids redirect loops in some local
  // dev/proxy/browser setups.
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
