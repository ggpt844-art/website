import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0d1a1f",
        mist: "#e8f0f2",
        sea: "#1f5c5f",
        coral: "#b85c4a",
        navy: "#0a1628",
        gold: "#c4a574",
        cream: "#fffcf8",
        paper: "#f7f5f2",
      },
      boxShadow: {
        lift: "0 24px 64px -12px rgba(10, 22, 40, 0.14), 0 0 0 1px rgba(10, 22, 40, 0.04)",
        card: "0 4px 24px rgba(10, 22, 40, 0.06), 0 0 0 1px rgba(10, 22, 40, 0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
