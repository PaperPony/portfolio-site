import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three / R3F ship ESM; transpile so Next bundles them cleanly.
  // motion-plus (and its motion-plus-dom dep) re-export through motion/mini;
  // transpiling lets Next resolve those re-exports during bundling.
  transpilePackages: ["three", "motion-plus", "motion-plus-dom"],
  webpack: (config) => {
    // `motion/mini` is `export * from 'framer-motion/dom/mini'`, and webpack
    // resolves that star-export target to framer-motion's CJS build, where it
    // can't see the named `animate` export — breaking motion-plus-dom's import.
    // Alias `motion/mini` straight to framer-motion's ESM entry, which exports
    // `animate` (and `animateSequence`) as real named bindings.
    config.resolve.alias = {
      ...config.resolve.alias,
      "motion/mini$": path.resolve(
        process.cwd(),
        "node_modules/framer-motion/dist/es/dom-mini.mjs"
      ),
    };
    return config;
  },
};

export default nextConfig;
