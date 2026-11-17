/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache Components y Partial Prefetching son funciones opcionales de
  // Next.js 16 pensadas para páginas con datos del servidor. Esta app
  // guarda todo en localStorage, así que no las necesitamos.
  cacheComponents: false,
  partialPrefetching: false,
};

export default nextConfig;
