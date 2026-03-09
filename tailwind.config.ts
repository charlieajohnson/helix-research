/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          950: "#05070B",
          900: "#080C14",
          800: "#0D1220",
          700: "#141B30",
          600: "#1C2540",
        },
        glass: {
          DEFAULT: "rgba(14, 18, 30, 0.6)",
          light: "rgba(22, 28, 48, 0.5)",
          border: "rgba(80, 100, 140, 0.15)",
          "border-bright": "rgba(120, 145, 190, 0.2)",
        },
        accent: {
          silver: "#B8C9E0",
          cyan: "#5EEAD4",
          "cyan-dim": "rgba(94, 234, 212, 0.12)",
          amber: "#FBBF24",
          "amber-dim": "rgba(251, 191, 36, 0.12)",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        panel: "12px",
        card: "8px",
        pill: "24px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-right": "slideRight 0.4s ease-out both",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        drift: "drift 20s ease-in-out infinite alternate",
        scanline: "scanline 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        drift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-20px, -15px) scale(1.05)" },
        },
        scanline: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "100%": { transform: "translateX(200%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
