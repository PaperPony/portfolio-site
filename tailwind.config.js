/** @type {import('tailwindcss').Config} */
module.exports = {
  // Single source of truth for the palette. CSS variables are declared in
  // app/globals.css; tune a color in one place and it updates everywhere.
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./content/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base (near-black + greys)
        ink: "var(--color-ink)",
        coal: "var(--color-coal)",
        slate2: "var(--color-slate)",
        ash: "var(--color-ash)",
        bone: "var(--color-bone)",
        // Neon "spray paint" accents
        neon: {
          magenta: "var(--color-magenta)",
          purple: "var(--color-purple)",
          cobalt: "var(--color-cobalt)",
          ember: "var(--color-ember)",
          lime: "var(--color-lime)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
