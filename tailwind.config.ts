import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#06070F",
        sidebar: "#0B0D1A",
        card: "#0F1120",
        border: "#1A1D2E",
        gold: "#C49832",
        "gold-hover": "#D4A843",
        "gold-muted": "#C4983220",
        text: "#E8E9F0",
        muted: "#6B7280",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
