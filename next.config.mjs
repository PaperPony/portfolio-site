/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three / R3F ship ESM; transpile so Next bundles them cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;
