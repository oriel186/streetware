import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem", screens: { "2xl": "1320px" } },
      colors: {
        background: "#f8f8f7",
        foreground: "#0f0f10",
        card: "#ffffff",
        muted: "#f1f1ef",
        border: "#d9d9d4",
        accent: "#111111",
        "accent-foreground": "#ffffff"
      },
      fontFamily: {
        sans: ["'Segoe UI Variable Text'", "'Manrope Fallback'", "sans-serif"],
        display: ["'Arial Narrow'", "'Segoe UI'", "sans-serif"]
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)",
        glow: "radial-gradient(circle at top right, rgba(0,0,0,.09), transparent 42%)"
      }
    }
  },
  plugins: []
};

export default config;
