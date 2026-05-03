import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0c1520",
        mist: "#e8f4f6",
        sea: "#1a6b6f",
        coral: "#c45c4a",
      },
    },
  },
  plugins: [],
} satisfies Config;
